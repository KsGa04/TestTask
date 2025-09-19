using System;

namespace ReactApp.Server.Services.Implementations
{
    public interface ILockService
    {
        bool TryAcquireLock(string sessionId);
        void ReleaseLock(string sessionId);
        bool IsLocked();
        string GetCurrentLockHolder();
        void ExtendLock(string sessionId);
        DateTime? GetLockTime(); // Изменяем на nullable DateTime
        bool IsCurrentHolder(string sessionId);
        void ForceRelease();
        LockInfo GetLockInfo(); // Новый метод для получения полной информации
    }

    public class LockInfo
    {
        public bool IsLocked { get; set; }
        public string CurrentHolder { get; set; }
        public DateTime? LockTime { get; set; }
        public TimeSpan? TimeSinceLock { get; set; }
    }

    public class LockService : ILockService
    {
        private readonly object _lock = new object();
        private string _currentLockHolder;
        private DateTime _lockTime;
        private readonly TimeSpan _lockDuration = TimeSpan.FromMinutes(5);

        public bool TryAcquireLock(string sessionId)
        {
            lock (_lock)
            {
                Console.WriteLine($"Попытка получения блокировки для сессии: {sessionId}");

                // Автоматически освобождаем блокировку по истечении времени
                if (!string.IsNullOrEmpty(_currentLockHolder) &&
                    (DateTime.Now - _lockTime) > _lockDuration)
                {
                    Console.WriteLine($"Блокировка истекла для сессии: {_currentLockHolder}");
                    _currentLockHolder = null;
                }

                if (string.IsNullOrEmpty(_currentLockHolder))
                {
                    _currentLockHolder = sessionId;
                    _lockTime = DateTime.Now;
                    Console.WriteLine($"Блокировка установлена для сессии: {sessionId}");
                    return true;
                }

                Console.WriteLine($"Блокировка уже установлена для сессии: {_currentLockHolder}, запрос от: {sessionId}");
                return _currentLockHolder == sessionId;
            }
        }

        public void ExtendLock(string sessionId)
        {
            lock (_lock)
            {
                if (_currentLockHolder == sessionId)
                {
                    _lockTime = DateTime.Now;
                    Console.WriteLine($"Блокировка продлена для сессии: {sessionId}");
                }
            }
        }

        public void ReleaseLock(string sessionId)
        {
            lock (_lock)
            {
                if (_currentLockHolder == sessionId)
                {
                    Console.WriteLine($"Блокировка снята для сессии: {sessionId}");
                    _currentLockHolder = null;
                }
            }
        }

        public void ForceRelease()
        {
            lock (_lock)
            {
                Console.WriteLine($"Принудительное освобождение блокировки. Было: {_currentLockHolder}");
                _currentLockHolder = null;
            }
        }

        public bool IsCurrentHolder(string sessionId)
        {
            lock (_lock)
            {
                return _currentLockHolder == sessionId;
            }
        }

        public bool IsLocked()
        {
            lock (_lock)
            {
                // Проверяем, не истекло ли время блокировки
                if (!string.IsNullOrEmpty(_currentLockHolder) &&
                    (DateTime.Now - _lockTime) > _lockDuration)
                {
                    Console.WriteLine($"Блокировка истекла для сессии: {_currentLockHolder}");
                    _currentLockHolder = null;
                }

                return !string.IsNullOrEmpty(_currentLockHolder);
            }
        }

        public string GetCurrentLockHolder()
        {
            lock (_lock)
            {
                return _currentLockHolder;
            }
        }

        public DateTime? GetLockTime()
        {
            lock (_lock)
            {
                return string.IsNullOrEmpty(_currentLockHolder) ? null : (DateTime?)_lockTime;
            }
        }

        public LockInfo GetLockInfo()
        {
            lock (_lock)
            {
                // Проверяем, не истекло ли время блокировки
                if (!string.IsNullOrEmpty(_currentLockHolder) &&
                    (DateTime.Now - _lockTime) > _lockDuration)
                {
                    Console.WriteLine($"Блокировка истекла для сессии: {_currentLockHolder}");
                    _currentLockHolder = null;
                }

                return new LockInfo
                {
                    IsLocked = !string.IsNullOrEmpty(_currentLockHolder),
                    CurrentHolder = _currentLockHolder,
                    LockTime = string.IsNullOrEmpty(_currentLockHolder) ? null : (DateTime?)_lockTime,
                    TimeSinceLock = string.IsNullOrEmpty(_currentLockHolder) ? null : (TimeSpan?)(DateTime.Now - _lockTime)
                };
            }
        }
    }
}