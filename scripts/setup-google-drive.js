const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// Google Drive API setup
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Your Google Drive folder ID from the URL
const DRIVE_FOLDER_ID = '1rxwnM1vY4C_pCxbiY6FzdNNaT93Jj2Mw';

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * Create an OAuth2 client with the given credentials
 */
async function authorize() {
  // Check if we already have credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    log('\n❌ credentials.json not found!', 'red');
    log('\nPlease follow these steps:', 'yellow');
    log('1. Go to: https://console.cloud.google.com/');
    log('2. Create a new project (or select existing)');
    log('3. Enable Google Drive API');
    log('4. Create OAuth 2.0 credentials (Desktop app)');
    log('5. Download credentials.json');
    log('6. Save it to: ' + CREDENTIALS_PATH);
    log('7. Run this script again\n');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Get new token
  return getNewToken(oAuth2Client);
}

/**
 * Get and store new token after prompting for user authorization
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    log('\n🔐 Authorize this app by visiting this URL:', 'cyan');
    log(authUrl + '\n', 'bright');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          log('\n❌ Error retrieving access token', 'red');
          return reject(err);
        }
        oAuth2Client.setCredentials(token);
        
        // Store the token for later use
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        log('\n✅ Token stored to ' + TOKEN_PATH, 'green');
        resolve(oAuth2Client);
      });
    });
  });
}

/**
 * Upload file to Google Drive
 */
async function uploadFile(auth, filePath, fileName, folderId = DRIVE_FOLDER_ID) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: 'application/json',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    return file.data;
  } catch (err) {
    log(`❌ Error uploading ${fileName}: ${err.message}`, 'red');
    throw err;
  }
}

/**
 * Create folder in Google Drive
 */
async function createFolder(auth, folderName, parentFolderId = DRIVE_FOLDER_ID) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
    });

    return file.data;
  } catch (err) {
    log(`❌ Error creating folder ${folderName}: ${err.message}`, 'red');
    throw err;
  }
}

/**
 * Setup folder structure
 */
async function setupFolders(auth) {
  log('\n📁 Setting up folder structure...', 'blue');

  const folders = {
    'ca-foundation': null,
    'jee-physics': null,
    'cbse-10-math': null,
    'ias-prelims': null,
    'summaries': null
  };

  for (const folderName of Object.keys(folders)) {
    try {
      const folder = await createFolder(auth, folderName);
      folders[folderName] = folder.id;
      log(`✓ Created folder: ${folderName} (${folder.id})`, 'green');
    } catch (err) {
      log(`⚠️  Folder ${folderName} may already exist`, 'yellow');
    }
  }

  // Save folder IDs for later use
  fs.writeFileSync(
    path.join(__dirname, 'drive-folders.json'),
    JSON.stringify(folders, null, 2)
  );

  log('\n✅ Folder structure ready!', 'green');
  return folders;
}

/**
 * Test connection
 */
async function testConnection(auth) {
  const drive = google.drive({ version: 'v3', auth });

  try {
    const res = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: 'id, name',
    });

    log(`\n✅ Connected to Google Drive!`, 'green');
    log(`📁 Main Folder: ${res.data.name} (${res.data.id})`, 'cyan');
    return true;
  } catch (err) {
    log(`\n❌ Connection test failed: ${err.message}`, 'red');
    return false;
  }
}

/**
 * Main setup
 */
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🔗 GOOGLE DRIVE SETUP', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  try {
    // Authorize
    log('🔐 Authorizing with Google Drive...', 'blue');
    const auth = await authorize();
    log('✅ Authorization successful!', 'green');

    // Test connection
    await testConnection(auth);

    // Setup folders
    await setupFolders(auth);

    log('\n' + '='.repeat(60), 'bright');
    log('🎉 SETUP COMPLETE!', 'green');
    log('='.repeat(60), 'bright');
    log('\nYou can now run content generation scripts.');
    log('Files will be uploaded to your Google Drive folder.\n');
    log('📁 Folder: https://drive.google.com/drive/folders/' + DRIVE_FOLDER_ID);
    log('\n💡 Next Step: Run content generation with Google Drive sync:');
    log('   node generate-with-drive.js\n');

  } catch (err) {
    log('\n❌ Setup failed: ' + err.message, 'red');
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  authorize,
  uploadFile,
  createFolder,
  DRIVE_FOLDER_ID
};

// Run if called directly
if (require.main === module) {
  main();
}
