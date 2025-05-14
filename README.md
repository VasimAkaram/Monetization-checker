# YouTube Channel Monetization Checker

A web application that analyzes YouTube channels and checks their monetization eligibility using the YouTube Data API v3.

## Features

- Check channel monetization eligibility
- Display subscriber count and progress towards monetization
- Show total video count and views
- View recent videos with thumbnails and statistics
- Interactive charts for video performance
- Modern, responsive UI

## Prerequisites

- Python 3.8+
- YouTube Data API v3 key
- Modern web browser

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-monetization-checker
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory and add your YouTube API key:
```
YOUTUBE_API_KEY=your_api_key_here
```

To get a YouTube API key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Copy the API key to your `.env` file

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Enter a YouTube channel URL or ID in the input field
2. Click "Analyze" or press Enter
3. View the detailed channel analysis:
   - Monetization eligibility status
   - Subscriber count and progress
   - Total views and video count
   - Recent videos with statistics
   - Video performance chart

## Project Structure

```
youtube-monetization-checker/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css  # Custom styles
│   └── js/
│       └── main.js    # Frontend JavaScript
├── templates/
│   └── index.html     # Main HTML template
└── .env               # Environment variables
```

## Technologies Used

- Backend:
  - Flask
  - Python
  - YouTube Data API v3
  - google-api-python-client

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5
  - Chart.js
  - Font Awesome

## License

MIT License 