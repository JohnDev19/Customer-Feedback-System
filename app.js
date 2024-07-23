const { useState, useEffect, useRef } = React;

function CustomerFeedback() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rating, setRating] = useState(null);
    const [category, setCategory] = useState('');
    const [comments, setComments] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [filter, setFilter] = useState('all');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    useEffect(() => {
        if (feedbacks.length > 0) {
            updateChart();
        }
    }, [feedbacks, filter]);

    const loadFeedbacks = () => {
        const storedFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        setFeedbacks(storedFeedbacks);
    };

    const saveFeedbacks = (updatedFeedbacks) => {
        localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
        if (!rating) newErrors.rating = 'Rating is required';
        if (!category) newErrors.category = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const sentiment = analyzeSentiment(comments);
            const newFeedback = { 
                name, 
                email, 
                rating, 
                category, 
                comments, 
                date: new Date().toISOString(),
                sentiment
            };
            const updatedFeedbacks = [...feedbacks, newFeedback];
            setFeedbacks(updatedFeedbacks);
            saveFeedbacks(updatedFeedbacks);
            resetForm();
            showNotification('Feedback submitted successfully!', 'success');
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setRating(null);
        setCategory('');
        setComments('');
        setErrors({});
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const updateChart = () => {
        const ctx = chartRef.current.getContext('2d');
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const filteredFeedbacks = filter === 'all' ? feedbacks : feedbacks.filter(f => f.category === filter);

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                datasets: [{
                    label: 'Ratings Distribution',
                    data: [1, 2, 3, 4, 5].map(stars => 
                        filteredFeedbacks.filter(f => parseInt(f.rating) === stars).length
                    ),
                    backgroundColor: 'rgba(74, 144, 226, 0.6)',
                    borderColor: 'rgba(74, 144, 226, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    const analyzeSentiment = (text) => {
        if (!text) return 'neutral';
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best'];
        const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worst', 'hate'];

        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(word => positiveWords.includes(word)).length;
        const negativeCount = words.filter(word => negativeWords.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    };

    const getSentimentDisplay = (sentiment) => {
        if (!sentiment) return '';
        return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    };

    const filteredFeedbacks = filter === 'all' ? feedbacks : feedbacks.filter(f => f.category === filter);

    const averageRating = filteredFeedbacks.length
        ? (filteredFeedbacks.reduce((acc, feedback) => acc + parseInt(feedback.rating), 0) / filteredFeedbacks.length).toFixed(1)
        : 0;

    return (
        <div className="container">
            <h1> Customer Feedback System</h1>
            <div className="dashboard">
                <div className="feedback-form">
                    <h2><i className="fas fa-pencil-alt"></i> Submit Your Feedback</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name"><i className="fas fa-user"></i> Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                            />
                            {errors.name && <div className="error">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email"><i className="fas fa-envelope"></i> Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                            {errors.email && <div className="error">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label><i className="fas fa-star"></i> Rating:</label>
                            <div className="star-rating">
                                {[5, 4, 3, 2, 1].map((value) => (
                                    <React.Fragment key={value}>
                                        <input
                                            type="radio"
                                            id={`star${value}`}
                                            name="rating"
                                            value={value}
                                            checked={rating === value.toString()}
                                            onChange={(e) => setRating(e.target.value)}
                                        />
                                        <label htmlFor={`star${value}`}></label>
                                    </React.Fragment>
                                ))}
                            </div>
                            {errors.rating && <div className="error">{errors.rating}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category"><i className="fas fa-tag"></i> Category:</label>
                            <div className="select-wrapper">
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    <option value="product">Product</option>
                                    <option value="service">Service</option>
                                    <option value="support">Support</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            {errors.category && <div className="error">{errors.category}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="comments"><i className="fas fa-comment"></i> Comments:</label>
                            <textarea
                                id="comments"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows="4"
                                placeholder="Enter your feedback here"
                            ></textarea>
                        </div>

                        <button type="submit"><i className="fas fa-paper-plane"></i> Submit Feedback</button>
                    </form>
                </div>

                <div className="feedback-summary">
                    <h2><i className="fas fa-chart-bar"></i> Feedback Summary</h2>
                    <div className="filters">
                        <button 
                            className={`filter-button ${filter === 'all' ? 'active' : ''}`} 
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-button ${filter === 'product' ? 'active' : ''}`} 
                            onClick={() => setFilter('product')}
                        >
                            Product
                        </button>
                        <button 
                            className={`filter-button ${filter === 'service' ? 'active' : ''}`} 
                            onClick={() => setFilter('service')}
                        >
                            Service
                        </button>
                        <button 
                            className={`filter-button ${filter === 'support' ? 'active' : ''}`} 
                            onClick={() => setFilter('support')}
                        >
                            Support
                        </button>
                        <button 
                            className={`filter-button ${filter === 'other' ? 'active' : ''}`} 
                            onClick={() => setFilter('other')}
                        >
                            Other
                        </button>
                    </div>
                    <p className="average-rating">
                        <i className="fas fa-star"></i> Average Rating: {averageRating}
                    </p>
                    <div className="chart-container" style={{height: '300px'}}>
                        <canvas ref={chartRef}></canvas>
                    </div>
                    {filteredFeedbacks.map((feedback, index) => (
                        <div key={index} className="feedback-item">
                            <strong><i className="fas fa-user"></i> {feedback.name}</strong> - {feedback.category}
                            <br />
                            <i className="fas fa-star"></i> Rating: {feedback.rating} stars
                            <br />
                            <i className="fas fa-calendar"></i> Date: {new Date(feedback.date).toLocaleString()}
                            <p><i className="fas fa-comment"></i> {feedback.comments}</p>
                            {feedback.sentiment && (
                                <span className={`sentiment-indicator sentiment-${feedback.sentiment}`}>
                                    {getSentimentDisplay(feedback.sentiment)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i> {notification.message}
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<CustomerFeedback />, document.getElementById('root'));