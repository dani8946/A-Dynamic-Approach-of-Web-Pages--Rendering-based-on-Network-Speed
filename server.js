const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const minify = require('html-minifier').minify;
const CleanCSS = require('clean-css');
const{ spawn } = require('child_process');
const app = express();
const PORT = 4000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text({ limit: '50mb' }));

app.post('/generateCaption', (req, res) => {
    const { imageUrls } = req.body;
    console.log(`Generating captions for ${imageUrls.length} images`);
    process.env.IMAGE_URLS = JSON.stringify(imageUrls);
    const pythonProcess = spawn('python', ['generate_caption.py']);

    
    let dataBuffer = '';

    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        dataBuffer += data; 
    });


    pythonProcess.on('error', (error) => {
        console.error('Error executing Python script:', error);
        res.status(500).json({ error: 'Failed to generate captions' });
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const captionsObject = JSON.parse(dataBuffer.trim());
                const captionsArray = Object.entries(captionsObject).map(([imageUrl, caption]) => ({ imageUrl, caption }));
                console.log('Captions generated:', captionsArray);
                res.json(captionsArray);
            } catch (parseError) {
                console.error('Error parsing captions:', parseError);
                res.status(500).json({ error: 'Failed to parse captions' });
            }
        } else {
            console.error('Python script exited with code', code);
            res.status(500).json({ error: 'Failed to generate captions' });
        }
    });
});
app.post('/minify-html', (req, res) => {
    try {
        const minifiedContent = minify(req.body, {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,           
            removeOptionalTags: true,             
            useShortDoctype: true,                              
            minifyURLs: true,                       
            minifyCSS: true,
            minifyJS: true
        });

        res.send(minifiedContent);
    } catch (error) {
        console.error("Error during HTML minification:", error);
        res.status(500).send('Error processing request.');
    }
});

app.post('/minify-css', (req, res) => {
    try {
        const cleanCSS = new CleanCSS({
            level: 2, 
        });
        const minifiedCSS = cleanCSS.minify(req.body);
        
        if (minifiedCSS.errors.length) {
            return res.status(400).send({ errors: minifiedCSS.errors });
        }

        res.send(minifiedCSS.styles);
    } catch (error) {
        console.error("Error during CSS minification:", error);
        res.status(500).send('Error processing request.');
    }
});

app.get('/test', (req, res) => res.send('Server is working!'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
