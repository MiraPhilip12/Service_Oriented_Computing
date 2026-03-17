import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    FoodDelivery
                </Link>

                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/restaurants" className="nav-link">Restaurants</Link>
                    </li>
                    
                    {isAuthenticated() ? (
                        <>
                            <li className="nav-item">
                                <Link to="/cart" className="nav-link cart-link">
                                    Cart
                                    {getCartCount() > 0 && (
                                        <span className="cart-badge">{getCartCount()}</span>
                                    )}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/orders" className="nav-link">My Orders</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <span className="nav-link dropdown-toggle">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item">Profile</Link>
                                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                                        Logout
                                    </button>
                                </div>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-link">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-link register-btn">Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;