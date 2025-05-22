# ⚡ Optimization of Web Page Based on Network Bandwidth – Chrome Extension

A smart Chrome extension that **monitors your network speed** and **dynamically renders the most optimized version of web pages** to ensure a smooth and accessible browsing experience. Whether you're on high-speed broadband or a patchy mobile network, this tool guarantees the best version of a page for your bandwidth.

---

## 🚀 Features

- ✅ **Real-Time Network Speed Detection**  
  Automatically detects your current network bandwidth.

- 🧠 **Dynamic Page Optimization**  
  Renders one of the three available page versions based on your bandwidth to ensure optimal performance.

- 📄 **Multiple Web Page Versions**
  - **Version 1 (V1)**: The original unoptimized version of the page.
  - **Version 2 (V2)**: Includes **script minification** and **image compression** for enhanced performance on moderately slow networks.
  - **Version 3 (V3)**: Adds **script minification** and **caption generation** for improved accessibility on slower connections.
    - Includes a lightweight fallback version with **script minification + alt text** for faster rendering when caption generation is too slow.

- 🌐 **Accessibility-First Design**  
  Makes browsing inclusive with automatic captioning or descriptive alternate text.

---

## 🛠️ How It Works

1. **Network Monitoring**  
   The extension continuously checks your real-time download speed.

2. **Version Selection Logic**  
   Based on thresholds (configurable in code), the extension automatically selects:
   - `V1` for fast connections,
   - `V2` for moderately slow connections,
   - `V3` or `V3-alt` for poor or unstable connections.

3. **Content Rendering**  
   The selected version of the page is dynamically loaded for the user, reducing load time and improving accessibility.

---

## 📦 Installation

1. Clone or download this repository:
   ```bash
   git clone https://https://github.com/dani8946/A-Dynamic-Approach-of-Web-Pages--Rendering-based-on-Network-Speed.git
   ```

2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer Mode** (top right corner).

4. Click **Load unpacked** and select the folder where you cloned this repo.

---

## 🧩 Usage

- Once installed, the extension will automatically detect your network bandwidth in the background.
- When you visit supported pages, it will render the appropriate version (`V1`, `V2`, `V3`, or `V3-alt`) without requiring any input.
- Optional settings can be adjusted from the extension popup (if enabled).

---

## 📊 Version Logic (Simplified)

| Bandwidth (Mbps) | Version Loaded | Features                                      |
|------------------|----------------|-----------------------------------------------|
| > 5 Mbps         | V1             | Original Web Page                             |
| 2 – 5 Mbps       | V2             | Minified Scripts + Compressed Images          |
| < 2 Mbps         | V3 / V3-alt    | Minified Scripts + Captions / Alt Text        |


---


## 💡 Future Enhancements

- User preference overrides
- Support for dynamic single-page applications (SPAs)
- Integration with web accessibility APIs (e.g., ARIA)
