const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    
    // Ensure secretKey is a Buffer
    if (typeof this.secretKey === 'string') {
      this.secretKey = Buffer.from(this.secretKey, 'hex');
    }
  }

  /**
   * Encrypt text
   */
  async encrypt(text) {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Return encrypted data with IV and auth tag
      return JSON.stringify({
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      });
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt text
   */
  async decrypt(encryptedData) {
    try {
      // Parse encrypted data
      const { encrypted, iv, authTag } = JSON.parse(encryptedData);

      // Convert hex strings to buffers
      const ivBuffer = Buffer.from(iv, 'hex');
      const authTagBuffer = Buffer.from(authTag, 'hex');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.secretKey,
        ivBuffer
      );

      // Set auth tag
      decipher.setAuthTag(authTagBuffer);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Generate key pair for end-to-end encryption
   */
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt with public key (for end-to-end encryption)
   */
  encryptWithPublicKey(text, publicKey) {
    try {
      const buffer = Buffer.from(text, 'utf8');
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (error) {
      console.error('Public key encryption error:', error);
      throw new Error('Failed to encrypt with public key');
    }
  }

  /**
   * Decrypt with private key (for end-to-end encryption)
   */
  decryptWithPrivateKey(encryptedText, privateKey) {
    try {
      const buffer = Buffer.from(encryptedText, 'base64');
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        buffer
      );
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Private key decryption error:', error);
      throw new Error('Failed to decrypt with private key');
    }
  }

  /**
   * Hash text (for comparison, not reversible)
   */
  hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verify encrypted data integrity
   */
  verifyIntegrity(encryptedData) {
    try {
      JSON.parse(encryptedData);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new EncryptionService();
