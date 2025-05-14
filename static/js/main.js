document.addEventListener('DOMContentLoaded', () => {
    const channelUrlInput = document.getElementById('channelUrl');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const results = document.getElementById('results');
    let viewsChart = null;

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        results.classList.add('d-none');
    }

    function updateSubscriberProgress(count) {
        const target = 1000;
        const percentage = Math.min((count / target) * 100, 100);
        const progressBar = document.getElementById('subscriberProgress');
        const statusText = document.getElementById('subscriberStatus');

        progressBar.style.width = `${percentage}%`;
        progressBar.classList.toggle('bg-success', count >= target);
        progressBar.classList.toggle('bg-warning', count < target);

        statusText.textContent = `${formatNumber(count)} / ${formatNumber(target)} subscribers required`;
    }

    function createViewsChart(recentVideos) {
        if (viewsChart) {
            viewsChart.destroy();
        }

        const ctx = document.getElementById('viewCountChart').getContext('2d');
        const labels = recentVideos.map(video => formatDate(video.publishDate));
        const data = recentVideos.map(video => parseInt(video.views));

        viewsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Video Views',
                    data: data,
                    backgroundColor: '#0d6efd',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatNumber(value)
                        }
                    }
                }
            }
        });
    }

    function displayRecentVideos(videos) {
        const container = document.getElementById('recentVideos');
        container.innerHTML = '';

        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'col-md-6 col-lg-4 recent-video-card';
            videoCard.innerHTML = `
                <div class="card h-100">
                    <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
                    <div class="video-info">
                        <h5 class="video-title">${video.title}</h5>
                        <div class="video-stats">
                            <span><i class="fas fa-eye"></i> ${formatNumber(video.views)} views</span>
                            <span class="ms-2"><i class="far fa-calendar"></i> ${formatDate(video.publishDate)}</span>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(videoCard);
        });
    }

    function updateChannelInfo(data) {
        document.getElementById('channelAvatar').src = data.channel.profilePicture;
        document.getElementById('channelTitle').textContent = data.channel.title;
        document.getElementById('channelDescription').textContent = data.channel.description;
        document.getElementById('subscriberCount').textContent = formatNumber(data.channel.subscriberCount);
        document.getElementById('viewCount').textContent = formatNumber(data.channel.viewCount);
        document.getElementById('videoCount').textContent = formatNumber(data.channel.videoCount);

        updateSubscriberProgress(parseInt(data.channel.subscriberCount));
        createViewsChart(data.recentVideos);
        displayRecentVideos(data.recentVideos);
    }

    async function analyzeChannel() {
        const channelUrl = channelUrlInput.value.trim();
        if (!channelUrl) {
            showError('Please enter a YouTube channel URL or ID');
            return;
        }

        loadingSpinner.classList.remove('d-none');
        results.classList.add('d-none');
        errorMessage.classList.add('d-none');

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ channel_url: channelUrl })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze channel');
            }

            results.classList.remove('d-none');
            updateChannelInfo(data);
        } catch (error) {
            showError(error.message);
        } finally {
            loadingSpinner.classList.add('d-none');
        }
    }

    analyzeBtn.addEventListener('click', analyzeChannel);
    channelUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeChannel();
        }
    });
}); 