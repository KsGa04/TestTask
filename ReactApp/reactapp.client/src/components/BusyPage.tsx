import React, { useState } from 'react';
import axios from 'axios';

const BusyPage: React.FC = () => {
    const [isReleasing, setIsReleasing] = useState(false);

    const handleReleaseMachine = async () => {
        if (window.confirm('Вы уверены, что хотите освободить автомат? Это может прервать текущую операцию другого пользователя.')) {
            setIsReleasing(true);
            try {
                await axios.post('/api/lock/release');
                alert('Автомат успешно освобожден!');
                // Перенаправляем на главную страницу
                window.location.href = '/';
            } catch (error) {
                console.error('Ошибка при освобождении автомата:', error);
                alert('Ошибка при освобождении автомата');
            } finally {
                setIsReleasing(false);
            }
        }
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            padding: '50px',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '500px',
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
                    Извините, в данный момент автомат занят
                </h1>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Другой пользователь использует автомат. Пожалуйста, попробуйте позже.
                </p>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Автомат будет автоматически освобожден через 5 минут неактивности.
                </p>
                <button
                    onClick={handleReleaseMachine}
                    disabled={isReleasing}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    {isReleasing ? 'Освобождение...' : 'Экстренное освобождение автомата'}
                </button>
            </div>
        </div>
    );
};

export default BusyPage;