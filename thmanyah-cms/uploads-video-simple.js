const fs = require('fs');
const http = require('http');
const path = require('path');

// Configuration
const SERVER_URL = 'localhost';
const SERVER_PORT = 3000;
const VIDEO_PATH = './test.mp4';

function createTestVideo() {
    const testVideoContent = 'This is a fake video file for testing purposes.';
    fs.writeFileSync('./test-video.mp4', testVideoContent);
    console.log('📹 Created test video file: test-video.mp4');
}

function uploadContent() {
    return new Promise((resolve, reject) => {
        // Check if video file exists
        if (!fs.existsSync(VIDEO_PATH)) {
            console.log('📹 Creating test video file...');
            createTestVideo();
        }

        console.log('🚀 Starting content upload...');

        // Read the video file
        const videoBuffer = fs.readFileSync(VIDEO_PATH);

        // Create boundary for multipart form data
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2, 8);

        // Build multipart form data
        let body = '';

        // Add metadata fields
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
        body += 'Test Video Upload\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="type"\r\n\r\n';
        body += 'video\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="category"\r\n\r\n';
        body += 'Test\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="description"\r\n\r\n';
        body += 'This is a test video upload via JavaScript\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="language"\r\n\r\n';
        body += 'ar\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="duration"\r\n\r\n';
        body += '3600\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="status"\r\n\r\n';
        body += 'draft\r\n';

        // Add video file
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="files"; filename="test-video.mp4"\r\n';
        body += 'Content-Type: video/mp4\r\n\r\n';

        // Convert body to buffer
        const bodyBuffer = Buffer.from(body, 'utf8');
        const endBoundary = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

        // Combine all parts
        const finalBody = Buffer.concat([bodyBuffer, videoBuffer, endBoundary]);

        // Create HTTP request
        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: '/content',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': finalBody.length
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Response Status: ${res.statusCode}`);

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ Content uploaded successfully!');
                    console.log('📊 Upload Result:');
                    console.log(JSON.stringify(result, null, 2));

                    if (result.mediaUrl) {
                        console.log(`🎥 Media URL: ${result.mediaUrl}`);
                    }
                    if (result.thumbnailUrl) {
                        console.log(`🖼️ Thumbnail URL: ${result.thumbnailUrl}`);
                    }

                    resolve(result);
                } catch (error) {
                    console.log('📄 Raw Response:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Upload failed:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 Make sure your CMS server is running on http://localhost:3000');
            }
            reject(error);
        });

        // Send the request
        req.write(finalBody);
        req.end();
    });
}

function uploadContentWithMultipleFiles() {
    return new Promise((resolve, reject) => {
        // Create test files if they don't exist
        if (!fs.existsSync('./test-video.mp4')) {
            createTestVideo();
        }
        if (!fs.existsSync('./test-image.jpg')) {
            const testImageContent = 'This is a fake image file for testing purposes.';
            fs.writeFileSync('./test-image.jpg', testImageContent);
            console.log('🖼️ Created test image file: test-image.jpg');
        }

        console.log('🚀 Starting content upload with multiple files...');

        const videoBuffer = fs.readFileSync('./test-video.mp4');
        const imageBuffer = fs.readFileSync('./test-image.jpg');

        // Create boundary for multipart form data
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2, 8);

        // Build multipart form data
        let body = '';

        // Add metadata fields
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
        body += 'Test Video with Thumbnail\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="type"\r\n\r\n';
        body += 'video\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="category"\r\n\r\n';
        body += 'Test\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="description"\r\n\r\n';
        body += 'This is a test video upload with thumbnail\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="language"\r\n\r\n';
        body += 'ar\r\n';

        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="duration"\r\n\r\n';
        body += '3600\r\n';

        // Add video file
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="files"; filename="test-video.mp4"\r\n';
        body += 'Content-Type: video/mp4\r\n\r\n';

        // Add image file
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="files"; filename="test-image.jpg"\r\n';
        body += 'Content-Type: image/jpeg\r\n\r\n';

        // Convert body to buffer
        const bodyBuffer = Buffer.from(body, 'utf8');
        const endBoundary = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

        // Combine all parts
        const finalBody = Buffer.concat([bodyBuffer, videoBuffer, imageBuffer, endBoundary]);

        // Create HTTP request
        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: '/content/upload',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': finalBody.length
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Response Status: ${res.statusCode}`);

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ Content with multiple files uploaded successfully!');
                    console.log('📊 Upload Result:');
                    console.log(JSON.stringify(result, null, 2));

                    if (result.mediaUrl) {
                        console.log(`🎥 Media URL: ${result.mediaUrl}`);
                    }
                    if (result.thumbnailUrl) {
                        console.log(`🖼️ Thumbnail URL: ${result.thumbnailUrl}`);
                    }

                    resolve(result);
                } catch (error) {
                    console.log('📄 Raw Response:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Upload failed:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 Make sure your CMS server is running on http://localhost:3000');
            }
            reject(error);
        });

        // Send the request
        req.write(finalBody);
        req.end();
    });
}

// Simple thumbnail upload function
function uploadThumbnail() {
    return new Promise((resolve, reject) => {
        const THUMBNAIL_PATH = './test-image.jpg';

        // Create test image if it doesn't exist
        if (!fs.existsSync(THUMBNAIL_PATH)) {
            const testImageContent = 'This is a fake image file for testing purposes.';
            fs.writeFileSync(THUMBNAIL_PATH, testImageContent);
            console.log('🖼️ Created test image file: test-image.jpg');
        }

        console.log('🖼️ Starting thumbnail upload...');

        const imageBuffer = fs.readFileSync(THUMBNAIL_PATH);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2, 8);

        let body = '';
        body += `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="thumbnail"; filename="test-image.jpg"\r\n';
        body += 'Content-Type: image/jpeg\r\n\r\n';

        const bodyBuffer = Buffer.from(body, 'utf8');
        const endBoundary = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
        const finalBody = Buffer.concat([bodyBuffer, imageBuffer, endBoundary]);

        const options = {
            hostname: SERVER_URL,
            port: SERVER_PORT,
            path: '/content/upload/thumbnail',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': finalBody.length
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 Thumbnail Response Status: ${res.statusCode}`);

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('✅ Thumbnail uploaded successfully!');
                    console.log('📊 Upload Result:');
                    console.log(JSON.stringify(result, null, 2));
                    resolve(result);
                } catch (error) {
                    console.log('📄 Raw Response:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Thumbnail upload failed:', error.message);
            reject(error);
        });

        req.write(finalBody);
        req.end();
    });
}

// Main execution
async function main() {
    console.log('🎬 Thmanyah CMS - Content Upload Script (Single Endpoint)');
    console.log('========================================================');

    try {
        console.log('\n1️⃣ Uploading content with single video file...');
        await uploadContent();

        // console.log('\n2️⃣ Uploading content with multiple files (video + image)...');
        // await uploadContentWithMultipleFiles();

        console.log('\n3️⃣ Uploading thumbnail separately...');
        await uploadThumbnail();

        console.log('\n✨ Upload script completed!');
        console.log('\n💡 Content is now created and ready to use!');
    } catch (error) {
        console.error('❌ Script failed:', error.message);
    }
}

// Run the script
main();
