import React, { useState, useEffect } from 'react';

const EncodingDebug: React.FC = () => {
    const [encodingInfo, setEncodingInfo] = useState<string>('');

    useEffect(() => {
        // Проверяем, как браузер интерпретирует символы
        const testString = 'Газированные напитки';
        const byteArray = new TextEncoder().encode(testString);
        const hexString = Array.from(byteArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');

        setEncodingInfo(`
      Исходная строка: ${testString}
      Байты (HEX): ${hexString}
      Длина в байтах: ${byteArray.length}
      Длина в символах: ${testString.length}
      UserAgent: ${navigator.userAgent}
      Язык браузера: ${navigator.language}
    `);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            <h2>Диагностика кодировки</h2>
            <p>{encodingInfo}</p>

            <h3>Тесты отображения:</h3>
            <p>1. Прямой текст: Газированные напитки</p>
            <p>2. Из переменной: {'Газированные напитки'}</p>
            <p>3. Unicode escape: {'\u0413\u0430\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043d\u0430\u043f\u0438\u0442\u043a\u0438'}</p>
            <p>4. Из импортированного модуля: </p>

            <h3>HTTP Заголовки:</h3>
            <button onClick={async () => {
                try {
                    const response = await fetch('/');
                    const headers = [];
                    for (const [key, value] of response.headers.entries()) {
                        headers.push(`${key}: ${value}`);
                    }
                    alert(headers.join('\n'));
                } catch (error) {
                    alert('Ошибка получения заголовков: ' + error);
                }
            }}>
                Показать заголовки ответа
            </button>
        </div>
    );
};

export default EncodingDebug;