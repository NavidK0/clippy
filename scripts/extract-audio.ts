// Import the necessary modules
import fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Promisify fs functions to use async/await
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// get path from args
const targetDir = process.argv[2];

function dataURIToArrayBufferView(dataURI: string): Uint8Array {
  // Validate input
  if (!dataURI.startsWith('data:')) {
    throw new Error('Invalid data URI');
  }

  // Split the data URI to get the base64 part
  const base64String = dataURI.split('base64,')[1];
  if (!base64String) {
    throw new Error('Invalid data URI format');
  }

  try {
    // Decode base64 string to a binary string
    const binaryString = atob(base64String);

    // Create an ArrayBuffer with the binary string's length
    const bytes = new Uint8Array(binaryString.length);

    // Convert the binary string to an array of bytes
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    // Handle decoding errors
    console.error('Error decoding base64 string:', error);
    throw new Error('Failed to decode base64 string');
  }
}

// Function to recursively read a directory for specific files
async function readDirectoryRecursively(directory: string) {
  const filesAndDirectories = await readdir(directory);

  for (const name of filesAndDirectories) {
    const fullPath = path.join(directory, name);
    const fileStat = await stat(fullPath);

    if (fileStat.isDirectory()) {
      await readDirectoryRecursively(fullPath); // Recursion for directories
    } else if (['sounds-mp3.ts', 'sounds-ogg.ts'].includes(name)) {
      console.log(`Found file: ${fullPath}`);

      // Import and process the file
      const module = await import(`file://${fullPath}`);
      processFile(fullPath, module);
    }
  }
}

// Function to process imported files
function processFile(fullPath: string, module: { soundMp3: any; soundOgg: any }) {
  const fileDir = path.dirname(fullPath);

  // fs.rmSync(`${fileDir}/audio/`, { recursive: true, force: true });
  fs.mkdirSync(`${fileDir}/audio/`, { recursive: true });

  const mp3Sounds: string[] = [];
  const oggSounds: string[] = [];

  if (module.soundMp3) {
    for (const soundMp3Key in module.soundMp3) {
      mp3Sounds.push(module.soundMp3[soundMp3Key]);
    }
  }

  if (module.soundOgg) {
    for (const soundOggKey in module.soundOgg) {
      oggSounds.push(module.soundOgg[soundOggKey]);
    }
  }

  function writeAudioFiles(blobList: string[], extension: string) {
    for (let i = 0; i < blobList.length; i++) {
      // convert base64 to blob and save to file
      const blob = dataURIToArrayBufferView(blobList[i]);
      const fileName = (i + 1).toString();

      try {
        fs.writeFileSync(`${fileDir}/audio/${fileName}.${extension}`, blob);

        console.log(`${extension.toUpperCase()} sound ${fileName}.${extension} written successfully`);
      } catch (err) {
        console.error(`Error writing ${fileName}.${extension}:`, err);
      }
    }
  }

  writeAudioFiles(oggSounds, 'ogg');
  writeAudioFiles(mp3Sounds, 'mp3');
}

// Start the directory reading process from a given root directory
readDirectoryRecursively(targetDir).catch(console.error);
