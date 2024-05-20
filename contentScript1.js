chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "minifyandcaptionContent") {
        minimizeContent(message.networkSpeed);  
    }
});

function minimizeContent(speed) {
    const pageHTML = document.documentElement.outerHTML;
    const originalSize = pageHTML.length;
    console.log(`Original HTML Size: ${originalSize} bytes`);
    fetch('http://localhost:4000/minify-html', {
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

        chrome.runtime.sendMessage({status: "minificationandcaptionCompleted"});

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
            fetch('http://localhost:4000/minify-css', {
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

    //External CSS from link tags
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    linkElements.forEach(link => {
        const href = link.href;
        promises.push(
            fetch(href)
            .then(response => response.text())
            .then(cssText => {
                return fetch('http://localhost:4000/minify-css', {
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
    CaptionGenerate();
    Promise.all(promises)
    .catch(error => {
      console.error("Error during CSS minification:", error);
    });
}

async function CaptionGenerate() {
  console.log("Called successfully");
  const imgElements = document.querySelectorAll('img');
  const imageUrls = [];

  imgElements.forEach(imgElement => {
    const imageUrl = imgElement.getAttribute('src');
    const something = "https:"+ imageUrl;
    imageUrls.push(something);
  });
  try {
    console.log("Img urls:", imageUrls);
    const captions = await generateCaptions(imageUrls);
    console.log("Captions:", captions);
    
    
    captions.forEach(({ imageUrl, caption}) =>{
      const imgSrc = imageUrl.replace(/^https?:/, '');
      const imgElement = document.querySelector(`img[src='${imgSrc}']`);
      console.log("Img element:", imgElement);
      if(imgElement){
        imgElement.alt = caption; 
        imgElement.src= '';
        imgElement.srcset = '';
        console.log("Caption added");
      }
    })
  } catch (error) {
    console.error('Error in CaptionGenerate:', error);
  }
}

  
async function generateCaptions(imageUrls) {
  try {
    console.log("Sending request to generate captions...");
    const response = await fetch('http://localhost:4000/generateCaption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrls })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const captions = await response.json();
    console.log("Captions received:", captions);
    return captions;
  } catch (error) {
    console.error('Error generating captions:', error);
    throw error;
  }
}

  