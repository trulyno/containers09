document.addEventListener('DOMContentLoaded', () => {
    // Initialize the mood tracker app
    const moodTracker = {
        // DOM Elements
        happyBtn: document.getElementById('happy'),
        neutralBtn: document.getElementById('neutral'),
        sadBtn: document.getElementById('sad'),
        messageBox: document.getElementById('message'),
        historyContainer: document.getElementById('history-container'),
        happyCount: document.getElementById('happy-count'),
        neutralCount: document.getElementById('neutral-count'),
        sadCount: document.getElementById('sad-count'),
        canvas: document.getElementById('mood-animation'),
        animateBtn: document.getElementById('animate-btn'),
        clearDataBtn: document.getElementById('clear-data'),
        
        // App state
        moods: [],
        currentMood: null,

        // Initialize the app
        init() {
            // Load saved data
            this.loadMoods();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update the UI
            this.updateHistory();
            this.updateStats();
        },

        // Set up all event listeners
        setupEventListeners() {
            // Mood buttons
            this.happyBtn.addEventListener('click', () => this.setMood('happy'));
            this.neutralBtn.addEventListener('click', () => this.setMood('neutral'));
            this.sadBtn.addEventListener('click', () => this.setMood('sad'));
            
            // Animate button
            this.animateBtn.addEventListener('click', () => this.animateMoods());
            
            // Clear data button
            this.clearDataBtn.addEventListener('click', () => this.clearData());
        },

        // Set the current mood
        setMood(mood) {
            // Remove selected class from all buttons
            this.happyBtn.classList.remove('selected');
            this.neutralBtn.classList.remove('selected');
            this.sadBtn.classList.remove('selected');
            
            // Add selected class to clicked button
            document.getElementById(mood).classList.add('selected');
            
            // Set current mood
            this.currentMood = mood;
            
            // Save mood to history
            this.saveMood(mood);
            
            // Show confirmation message
            this.showMessage(`You're feeling ${mood} today!`);
            
            // Update stats and history
            this.updateHistory();
            this.updateStats();
        },

        // Save a mood to history
        saveMood(mood) {
            const today = new Date().toISOString().split('T')[0];
            
            // Check if already recorded a mood today
            const existingIndex = this.moods.findIndex(item => item.date === today);
            
            if (existingIndex !== -1) {
                // Update existing mood
                this.moods[existingIndex].mood = mood;
            } else {
                // Add new mood
                this.moods.push({ date: today, mood: mood });
            }
            
            // Save to local storage
            localStorage.setItem('moods', JSON.stringify(this.moods));
        },

        // Load moods from local storage
        loadMoods() {
            const savedMoods = localStorage.getItem('moods');
            if (savedMoods) {
                this.moods = JSON.parse(savedMoods);
            }
        },

        // Update the mood history display
        updateHistory() {
            // Clear history container
            this.historyContainer.innerHTML = '';
            
            if (this.moods.length === 0) {
                this.historyContainer.innerHTML = '<p class="empty-state">Your mood history will appear here</p>';
                return;
            }
            
            // Sort moods by date (newest first)
            const sortedMoods = [...this.moods].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Display up to the last 7 entries
            const recentMoods = sortedMoods.slice(0, 7);
            
            recentMoods.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.className = 'mood-entry';
                
                // Format the date
                const date = new Date(entry.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
                
                // Set emoji based on mood
                let emoji = '';
                if (entry.mood === 'happy') emoji = '😀';
                else if (entry.mood === 'neutral') emoji = '😐';
                else emoji = '😔';
                
                entryElement.innerHTML = `
                    <span class="date">${formattedDate}</span>
                    <span class="mood ${entry.mood}">${emoji} ${entry.mood}</span>
                `;
                
                this.historyContainer.appendChild(entryElement);
            });
        },

        // Update the mood statistics
        updateStats() {
            let happyCount = 0;
            let neutralCount = 0;
            let sadCount = 0;
            
            this.moods.forEach(entry => {
                if (entry.mood === 'happy') happyCount++;
                else if (entry.mood === 'neutral') neutralCount++;
                else sadCount++;
            });
            
            this.happyCount.textContent = happyCount;
            this.neutralCount.textContent = neutralCount;
            this.sadCount.textContent = sadCount;
        },

        // Show a message to the user
        showMessage(message) {
            this.messageBox.textContent = message;
            this.messageBox.style.backgroundColor = 'rgba(110, 142, 251, 0.2)';
            
            // Clear message after 3 seconds
            setTimeout(() => {
                this.messageBox.textContent = '';
                this.messageBox.style.backgroundColor = 'transparent';
            }, 3000);
        },

        // Animate moods on the canvas
        animateMoods() {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.moods.length === 0) {
                this.showMessage('No moods to animate yet');
                return;
            }
            
            // Create particles based on moods
            const particles = [];
            this.moods.forEach(entry => {
                let color;
                if (entry.mood === 'happy') color = '#FFD700';
                else if (entry.mood === 'neutral') color = '#87CEEB';
                else color = '#6495ED';
                
                particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    radius: 5 + Math.random() * 5,
                    color: color,
                    speedX: -1 + Math.random() * 2,
                    speedY: -1 + Math.random() * 2
                });
            });
            
            // Animation function
            const animate = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                particles.forEach(particle => {
                    // Move particle
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // Bounce off walls
                    if (particle.x <= 0 || particle.x >= this.canvas.width) {
                        particle.speedX = -particle.speedX;
                    }
                    
                    if (particle.y <= 0 || particle.y >= this.canvas.height) {
                        particle.speedY = -particle.speedY;
                    }
                    
                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                    ctx.fillStyle = particle.color;
                    ctx.fill();
                });
                
                requestAnimationFrame(animate);
            };
            
            animate();
        },

        // Clear all stored data
        clearData() {
            if (confirm('Are you sure you want to clear all your mood data?')) {
                this.moods = [];
                localStorage.removeItem('moods');
                this.updateHistory();
                this.updateStats();
                this.showMessage('All mood data cleared');
                
                // Remove selected class from buttons
                this.happyBtn.classList.remove('selected');
                this.neutralBtn.classList.remove('selected');
                this.sadBtn.classList.remove('selected');
            }
        }
    };

    // Initialize the app
    moodTracker.init();
});
