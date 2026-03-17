import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './MenuItem.css';

const MenuItem = ({ item, restaurantId }) => {
    const [quantity, setQuantity] = useState(1);
    const [showCustomization, setShowCustomization] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({});
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        const itemWithOptions = {
            ...item,
            selectedOptions,
            quantity
        };
        addToCart(itemWithOptions, restaurantId);
        setQuantity(1);
        setSelectedOptions({});
        setShowCustomization(false);
    };

    const handleOptionChange = (optionName, selectedValue) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: selectedValue
        }));
    };

    return (
        <div className="menu-item">
            <div className="menu-item-image">
                <img 
                    src={item.imageUrl || 'https://via.placeholder.com/100x100?text=Food'} 
                    alt={item.name}
                />
                {!item.isAvailable && (
                    <span className="unavailable-badge">Unavailable</span>
                )}
            </div>
            
            <div className="menu-item-details">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-description">{item.description}</p>
                
                <div className="item-meta">
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    {item.preparationTime && (
                        <span className="prep-time">
                            ⏱️ {item.preparationTime} min
                        </span>
                    )}
                </div>

                {item.customization && item.customization.length > 0 && (
                    <div className="item-customization">
                        <button 
                            className="customize-toggle"
                            onClick={() => setShowCustomization(!showCustomization)}
                        >
                            {showCustomization ? 'Hide Options' : 'Customize +'}
                        </button>
                        
                        {showCustomization && (
                            <div className="customization-options">
                                {item.customization.map(option => (
                                    <div key={option.name} className="option-group">
                                        <label>{option.name}:</label>
                                        <select 
                                            onChange={(e) => handleOptionChange(
                                                option.name, 
                                                e.target.value
                                            )}
                                        >
                                            <option value="">Select</option>
                                            {option.options.map(opt => (
                                                <option key={opt.name} value={opt.name}>
                                                    {opt.name} {opt.price > 0 && `(+$${opt.price})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="item-actions">
                    <div className="quantity-control">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    
                    <button 
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={!item.isAvailable}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;