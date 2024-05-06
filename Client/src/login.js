import React from 'react';
import GoogleButton from 'react-google-button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Col, Row } from 'antd';

export default function Login() {

    const handleLogin = async () => {
        try {
            const { data: { url } } = await axios.get(`http://localhost:5000/auth/url`);
            
            window.location.assign(url);
        } catch (err) {
            console.error(err);
            // Optionally, provide user feedback for errors
        }
    };

    return (
        <div className="user-profile">
            <div className="login-card">                
                <Row justify="center" align="middle" gutter={10}>
                    <Col md={16} style={{ margin: '0px', display: 'flex', alignItems: 'center' }}>
                        {/* Display any additional content here */}
                    </Col>
                    <Col md={8}>
                        <h2>Login</h2>
                        <GoogleButton
                            className="google-login-btn"
                            type="light" // Can be light or dark
                            onClick={handleLogin}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}
