Here is your entire content rewritten in one Markdown block:

```markdown
### Install Dependencies:

Install all required dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

### Start the Development Server:

Start the React development server:

```bash
npm start
# or
yarn start
```

Your app will be running on `http://localhost:3000`.

### Open the App:

Open your web browser and go to `http://localhost:3000` to start using the QR Code Generator.

## Using the App

### Text/URL Mode:
1. Select the "Text/URL" tab.
2. Enter your desired text or URL in the input field.
3. Click the "Generate QR Code" button to generate the QR code.
4. You can download the generated QR code by clicking the "Download QR Code" button.

### Image Mode:
1. Select the "Image" tab.
2. Upload an image file.
3. The app will generate a QR code based on the image's data.
4. Download the QR code as a PNG file.

## Docker Setup (Optional)

If you want to run the app in a Docker container, follow these steps:

### Step 1: Build the Docker Image

```bash
docker build -t qr-code-generator .
```

### Step 2: Run the Docker Container

```bash
docker run -p 80:80 qr-code-generator
```

This will run the app on `http://localhost:80`.

### Docker Compose (Optional)

You can also use docker-compose to simplify the setup:

### Build and Run Using Docker Compose:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000` in your browser.

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, create a branch, and submit a pull request with your changes.

## License

This project is open-source and available under the MIT License.
```