require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// YouTube API setup
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

// Helper function to extract channel ID from URL
function extractChannelId(channelInput) {
    if (!channelInput) {
        throw new Error('Channel input cannot be empty');
    }

    const urlPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([^\/\s?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([^\/\s?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^\/\s?]+)/,
        /(?:channel\/|c\/|@)([^\/\s?]+)/
    ];

    for (const pattern of urlPatterns) {
        const match = channelInput.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return channelInput.trim();
}

// Helper function to safely get statistics
function safeGetStat(stats, key, defaultValue = 0) {
    try {
        return parseInt(stats[key] || defaultValue);
    } catch {
        return defaultValue;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/analyze', async (req, res) => {
    try {
        const { channel_url } = req.body;

        if (!channel_url) {
            return res.status(400).json({ error: 'Channel URL is required' });
        }

        const channelId = extractChannelId(channel_url);

        // Get channel statistics
        const channelResponse = await youtube.channels.list({
            part: 'snippet,statistics,brandingSettings',
            id: channelId
        });

        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
            // Try searching by username if @ is present
            if (channel_url.includes('@')) {
                const username = channel_url.split('@')[1];
                const usernameResponse = await youtube.channels.list({
                    part: 'snippet,statistics,brandingSettings',
                    forUsername: username
                });

                if (!usernameResponse.data.items || usernameResponse.data.items.length === 0) {
                    return res.status(404).json({ error: 'Channel not found' });
                }

                channelResponse.data.items = usernameResponse.data.items;
            } else {
                return res.status(404).json({ error: 'Channel not found' });
            }
        }

        const channelData = channelResponse.data.items[0];
        const stats = channelData.statistics || {};
        const snippet = channelData.snippet || {};

        // Get recent videos
        let recentVideos = [];
        try {
            const videosResponse = await youtube.search.list({
                part: 'id',
                channelId: channelData.id,
                order: 'date',
                type: 'video',
                maxResults: 10
            });

            const videoIds = videosResponse.data.items.map(item => item.id.videoId);

            if (videoIds.length > 0) {
                const videosDetails = await youtube.videos.list({
                    part: 'snippet,statistics',
                    id: videoIds.join(',')
                });

                recentVideos = videosDetails.data.items.map(video => ({
                    title: video.snippet.title,
                    views: safeGetStat(video.statistics, 'viewCount'),
                    publishDate: video.snippet.publishedAt,
                    thumbnail: video.snippet.thumbnails.medium?.url || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            // Continue with empty videos array
        }

        // Prepare response
        const subscriberCount = safeGetStat(stats, 'subscriberCount');
        const viewCount = safeGetStat(stats, 'viewCount');
        const videoCount = safeGetStat(stats, 'videoCount');

        const responseData = {
            channel: {
                title: snippet.title || 'Unknown',
                description: snippet.description || '',
                country: snippet.country || 'Not specified',
                creationDate: snippet.publishedAt || '',
                subscriberCount,
                viewCount,
                videoCount,
                profilePicture: snippet.thumbnails?.high?.url || '',
                bannerImage: channelData.brandingSettings?.image?.bannerExternalUrl || ''
            },
            monetization: {
                subscribers: subscriberCount >= 1000,
                total_videos: videoCount,
                total_views: viewCount
            },
            recentVideos
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error:', error);
        if (error.message.toLowerCase().includes('quota')) {
            return res.status(429).json({ error: 'YouTube API quota exceeded. Please try again later.' });
        }
        res.status(500).json({ error: 'An error occurred while analyzing the channel' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 