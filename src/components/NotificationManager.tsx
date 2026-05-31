import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { requestNotificationPermissionAndGetToken, listenToForegroundMessages } from '../firebase';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationManager = () => {
    const { user } = useAuth();
    const { storeSettings } = useStore();
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(Notification.permission);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then(function(registration) {
                console.log('Registration successful, scope is:', registration.scope);
            }).catch(function(err) {
                console.log('Service worker registration failed, error:', err);
            });
        }
    }, []);

    useEffect(() => {
        let unsubscribe = () => {};
        
        const setupForeground = async () => {
            const unsub = await listenToForegroundMessages((payload) => {
                console.log('Message received. ', payload);
                // Create local notification if in foreground
                if (Notification.permission === 'granted') {
                    new Notification(payload.notification?.title || 'Notificación', {
                        body: payload.notification?.body,
                        icon: '/icon.svg'
                    });
                }
            });
            if (typeof unsub === 'function') {
                unsubscribe = unsub;
            }
        };

        setupForeground();

        return () => {
            unsubscribe();
        };
    }, []);

    const handleSubscribe = async () => {
        if (!storeSettings.vapidKey) {
            toast.error('El administrador de la tienda no ha configurado la clave VAPID. Por favor, avisa a soporte.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const reg = await navigator.serviceWorker.ready;
                
                // Need to convert VAPID Key to Uint8Array
                const urlBase64ToUint8Array = (base64String: string) => {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);
                    for (let i = 0; i < rawData.length; ++i) {
                        outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                };

                const currentToken = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(storeSettings.vapidKey)
                });
                
                setToken(JSON.stringify(currentToken));
                setPermissionStatus('granted');
                console.log('Suscripción generada:', currentToken);
                // Send this token to the server/database for the user
                if (user && user.phone) {
                    fetch('/api/users', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: user.phone, notificationToken: JSON.stringify(currentToken) })
                    }).catch(console.error);
                }
                toast.success('¡Suscrito a notificaciones push exitosamente!');
            } else {
                setPermissionStatus(Notification.permission);
                toast.error('No se pudo obtener el token. Asegúrate de dar permisos al navegador.');
            }
        } catch (e) {
            console.error('Subscripción fallida', e);
            toast.error('Error intentando suscribirse a notificaciones.');
        }
    };

    if (!user || user.role !== 'CLIENTE') return null;

    if (permissionStatus === 'granted' && token) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-surface-container border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg backdrop-blur text-xs">
                    <Bell size={16} className="text-brand-primary" />
                    <span className="text-gray-300 font-bold">Notificaciones activas</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button 
                onClick={handleSubscribe}
                className="bg-brand-primary text-black font-black uppercase tracking-widest text-xs px-4 py-3 rounded-full flex items-center gap-2 hover:bg-brand-yellow hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(225,184,70,0.3)]"
            >
                <Bell size={16} />
                Activar Notificaciones
            </button>
        </div>
    );
};
