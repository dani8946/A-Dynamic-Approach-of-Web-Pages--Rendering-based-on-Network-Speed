chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "minifyandcompContent") {
        minimizeContent(message.networkSpeed);  
    }
});
function minimizeContent(speed) {
    const pageHTML = document.documentElement.outerHTML;
    const originalSize = pageHTML.length;
    console.log(`Original HTML Size: ${originalSize} bytes`);
    fetch('http://localhost:5000/minify-html', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: pageHTML  
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
    })
    .then(minifiedHTML => {
        console.log("HTML Minification successful");
        const minifiedSize = minifiedHTML.length;
        console.log(`Minified HTML Size: ${minifiedSize} bytes`);
       
        minifiedHTML = "<!-- Minified using our Chrome Extension -->" + minifiedHTML;
        const newDoc = document.implementation.createHTMLDocument("");
        newDoc.documentElement.innerHTML = minifiedHTML;
        while (document.firstChild) {
            document.removeChild(document.firstChild);
        }
        document.appendChild(document.importNode(newDoc.documentElement, true));

        
        return minimizeCSS();
    })
    .then(() => {
        console.log("CSS Minification successful");
        console.log(`Optimization happened because network speed is: ${parseFloat(speed).toFixed(2)} Mbps`);
        chrome.runtime.sendMessage({status: "minificationandcompCompleted"});
    })
    .catch(error => {
        console.error("Error during minification:", error);
    });
}

function minimizeCSS() {
    let promises = [];
    const styleElements = Array.from(document.querySelectorAll('style'));
    styleElements.forEach(style => {
        const cssText = style.innerHTML;
        const originalSize = cssText.length;
        console.log(`Original CSS Size: ${originalSize} bytes`);

        promises.push(
            fetch('http://localhost:5000/minify-css', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: cssText
            })
            .then(response => response.text())
            .then(minifiedCSS => {
                style.innerHTML = minifiedCSS;
                const minifiedSize = minifiedCSS.length;
                console.log(`Minified CSS Size: ${minifiedSize} bytes`);
            })
        );
    });

    //External CSS tags
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    linkElements.forEach(link => {
        const href = link.href;
        promises.push(
            fetch(href)
            .then(response => response.text())
            .then(cssText => {
                return fetch('http://localhost:5000/minify-css', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: cssText
                });
            })
            .then(response => response.text())
            .then(minifiedCSS => {
                const blob = new Blob([minifiedCSS], { type: 'text/css' });
                const blobURL = URL.createObjectURL(blob);
                link.href = blobURL;
            })
        );
    });
    
     compressAllImages();
    Promise.all(promises)
    .catch(error => {
        console.error("Error during CSS minification:", error);
    });
}


function compressAllImages() {
    console.log("Script started working");
    const images = document.querySelectorAll("img");

    images.forEach(img => {
        if (img.src && !img.src.toLowerCase().endsWith(".svg")) {
            compressImage(img, compressedDataUrl => {
                img.src = img.srcset = compressedDataUrl;
                console.log("Compression completed");
            });
        }
    });
}

function compressImage(img, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";


    image.onload = () => {
        const width = image.width;
        const height = image.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const offsets = [-width * 4 - 4, -width * 4, -width * 4 + 4, -4, 4, width * 4 - 4, width * 4, width * 4 + 4];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = (y * width + x) * 4;
                let sumRed = 0, sumGreen = 0, sumBlue = 0;

                // Calculate average RGB values of 8 neighbors
                for (const offset of offsets) {
                    const neighborIndex = pixelIndex + offset;
                    if (neighborIndex >= 0 && neighborIndex < data.length) {
                        sumRed += data[neighborIndex];
                        sumGreen += data[neighborIndex + 1];
                        sumBlue += data[neighborIndex + 2];
                    }
                }

                // Average RGB values
                const avgRed = sumRed / 9;
                const avgGreen = sumGreen / 9;
                const avgBlue = sumBlue / 9;

                // Assign to current pixel
                data[pixelIndex] = avgRed;
                data[pixelIndex + 1] = avgGreen;
                data[pixelIndex + 2] = avgBlue;
            }
        }

        // Update canvas 
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(blob => {
            const compressedDataUrl = URL.createObjectURL(blob);
            callback(compressedDataUrl);
        }, 'image/webp');
    };

    image.src = img.src;
}
