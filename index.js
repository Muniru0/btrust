import * as http  from 'http';
import * as utils from './server_assets/utils.js'

import fs from 'fs';
import path from 'path';
import * as url from 'url';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = `.${parsedUrl.pathname}`;
    if(req.method === "POST"){


        res.writeHead(200,{"Content-type": "application/json"});
        res.end(JSON.stringify(utils.decodeRawTransaction()));

    }else{


    // Set the base directory for static files
    const staticBasePath = path.join(process.cwd(), 'build_wallet');

    // Specify the default file to serve
    const defaultFile = 'index.html';

    // Construct the file path
    let filePath = path.join(staticBasePath, pathname);

    // If the request is for a directory (e.g., '/'), serve the default file
    if (pathname.endsWith('/')) {
        filePath = path.join(filePath, defaultFile);
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        // Determine the content type based on the file extension
        const ext = path.extname(filePath);
        let contentType = 'text/html'; // Default to HTML
        if (ext === '.js') {
            contentType = 'application/javascript';
        } else if (ext === '.css') {
            contentType = 'text/css';
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    
        
    });
}

});



// const server = http.createServer((req, res) => {
//   const reqUrl = url.parse(req.url, true);

//    // Define the path to the HTML file
//    const filePath = path.join(process.cwd(), '/build_wallet/index.html');

//    // Read the HTML file content
//    fs.readFile(filePath, (err, content) => {
//        if (err) {
//            // If an error occurs, send a 500 Internal Server Error response
//            res.writeHead(500);
//            res.end('Server Error' + filePath);
//            return;
//        }
//        // If the file is read successfully, send a 200 OK response with the content
//        res.writeHead(200, { 'Content-Type': 'text/html' });
//        res.end(content);
//    });


// //   // Check if the request URL is "/user"
// //   if (reqUrl.pathname === '/user') {
// //     // Handle requests to "/user" here
// //     if (req.method === 'GET') {
// //       res.writeHead(200, { 'Content-Type': 'application/json' });
// //       const data = { message: 'This is the user endpoint' };
// //       res.end(JSON.stringify(data));
// //     } else {
// //       // Respond with a 405 Method Not Allowed if the method is not GET
// //       res.writeHead(405, { 'Content-Type': 'application/json' });
// //       res.end(JSON.stringify({ message: 'Method Not Allowed' }));
// //     }
// //   } else {
// //     // Respond to other paths or a 404 Not Found error for unspecified routes
// //     res.writeHead(404, { 'Content-Type': 'application/json' });
// //     res.end(JSON.stringify({ message: 'Not Found' }));
// //   }
// });

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});