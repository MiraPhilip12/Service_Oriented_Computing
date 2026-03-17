import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    const [popularCuisines, setPopularCuisines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [restaurantsRes, cuisinesRes] = await Promise.all([
                    api.get('/restaurants?limit=6'),
                    api.get('/restaurants/cuisines/popular')
                ]);
                
                setFeaturedRestaurants(restaurantsRes.data.data);
                setPopularCuisines(cuisinesRes.data.data || [
                    'Pizza', 'Burger', 'Sushi', 'Chinese', 'Mexican', 'Indian'
                ]);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Delicious Food Delivered to Your Door</h1>
                    <p>Order from the best local restaurants with easy tracking</p>
                    <Link to="/restaurants" className="btn btn-primary">
                        Order Now
                    </Link>
                </div>
            </section>

            {/* Popular Cuisines */}
            <section className="cuisines-section">
                <div className="container">
                    <h2>Popular Cuisines</h2>
                    <div className="cuisines-grid">
                        {popularCuisines.map((cuisine, index) => (
                            <Link 
                                key={index}
                                to={`/restaurants?cuisine=${cuisine}`}
                                className="cuisine-card"
                            >
                                <span>{cuisine}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Restaurants */}
            <section className="featured-section">
                <div className="container">
                    <h2>Featured Restaurants</h2>
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="restaurants-grid">
                            {featuredRestaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant._id} 
                                    restaurant={restaurant} 
                                />
                            ))}
                        </div>
                    )}
                    <div className="view-all">
                        <Link to="/restaurants" className="btn btn-outline">
                            View All Restaurants
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2>How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-icon">1</div>
                            <h3>Choose Restaurant</h3>
                            <p>Browse through hundreds of restaurants</p>
                        </div>
                        <div className="step">
                            <div className="step-icon">2</div>
                            <h3>Select Food</h3>
                            <p>Pick your favorite dishes and customize</p>
                        </div>
                        <div className="step">
                            <div className="step-icon">3</div>
                            <h3>Place Order</h3>
                            <p>Confirm and pay for your order</p>
                        </div>
                        <div className="step">
                            <div className="step-icon">4</div>
                            <h3>Track Delivery</h3>
                            <p>Follow your food in real-time</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;