import React, { useState, useEffect } from 'react';

const EncodingDebug: React.FC = () => {
    const [encodingInfo, setEncodingInfo] = useState<string>('');

    useEffect(() => {
        // ���������, ��� ������� �������������� �������
        const testString = '������������ �������';
        const byteArray = new TextEncoder().encode(testString);
        const hexString = Array.from(byteArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');

        setEncodingInfo(`
      �������� ������: ${testString}
      ����� (HEX): ${hexString}
      ����� � ������: ${byteArray.length}
      ����� � ��������: ${testString.length}
      UserAgent: ${navigator.userAgent}
      ���� ��������: ${navigator.language}
    `);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            <h2>����������� ���������</h2>
            <p>{encodingInfo}</p>

            <h3>����� �����������:</h3>
            <p>1. ������ �����: ������������ �������</p>
            <p>2. �� ����������: {'������������ �������'}</p>
            <p>3. Unicode escape: {'\u0413\u0430\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043d\u0430\u043f\u0438\u0442\u043a\u0438'}</p>
            <p>4. �� ���������������� ������: </p>

            <h3>HTTP ���������:</h3>
            <button onClick={async () => {
                try {
                    const response = await fetch('/');
                    const headers = [];
                    for (const [key, value] of response.headers.entries()) {
                        headers.push(`${key}: ${value}`);
                    }
                    alert(headers.join('\n'));
                } catch (error) {
                    alert('������ ��������� ����������: ' + error);
                }
            }}>
                �������� ��������� ������
            </button>
        </div>
    );
};

export default EncodingDebug;