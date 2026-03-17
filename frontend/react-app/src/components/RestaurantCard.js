import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
    return (
        <div className="restaurant-card">
            <div className="restaurant-image">
                <img 
                    src={restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=Restaurant'} 
                    alt={restaurant.name}
                />
                {!restaurant.isAvailable && (
                    <span className="closed-badge">Closed</span>
                )}
            </div>
            
            <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                
                <div className="restaurant-meta">
                    <span className="rating">
                        ⭐ {restaurant.rating?.toFixed(1) || 'New'}
                    </span>
                    <span className="cuisine">
                        {restaurant.cuisine?.slice(0, 3).join(' • ')}
                    </span>
                </div>
                
                <p className="restaurant-address">
                    {restaurant.address?.street}, {restaurant.address?.city}
                </p>
                
                <div className="restaurant-footer">
                    <span className="delivery-time">
                        🛵 {restaurant.deliveryTime || '30-40'} min
                    </span>
                    <Link 
                        to={`/restaurant/${restaurant._id}`} 
                        className="view-menu-btn"
                    >
                        View Menu →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;