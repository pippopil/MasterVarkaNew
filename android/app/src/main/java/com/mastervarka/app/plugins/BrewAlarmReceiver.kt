package com.mastervarka.app.plugins

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.mastervarka.app.MainActivity

/**
 * Нативный BroadcastReceiver для аппаратных будильников AlarmManager.
 * Срабатывает даже при заблокированном телефоне и в режиме глубокого энергосбережения (Doze Mode).
 */
class BrewAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "⏰ Таймер варки МастерВарка"
        val body = intent.getStringExtra("body") ?: "Температурная пауза или этап кипячения завершен!"
        val alarmId = intent.getIntExtra("alarmId", System.currentTimeMillis().toInt())

        // 1. Захват WakeLock на 10 секунд для пробуждения процессора
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
        val wakeLock = powerManager?.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "MasterVarka:BrewAlarmWakeLock"
        )
        wakeLock?.acquire(10000L)

        // 2. Вибрация
        try {
            val vibrationPattern = longArrayOf(0, 400, 200, 400, 200, 800)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createWaveform(vibrationPattern, -1)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createWaveform(vibrationPattern, -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(vibrationPattern, -1)
                }
            }
        } catch (_: Exception) {}

        // 3. Звуковой сигнал через RingtoneManager
        try {
            val alarmSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val ringtone = RingtoneManager.getRingtone(context, alarmSoundUri)
            ringtone?.play()
        } catch (_: Exception) {}

        // 4. Показ системного уведомления с наивысшим приоритетом (Heads-Up)
        try {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val channelId = "mastervarka_exact_alarms_channel"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val alarmSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                    ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()

                val channel = NotificationChannel(
                    channelId,
                    "⏰ Точные будильники варки (AlarmManager)",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Критически важные оповещения пауз затирания и хмеля"
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 400, 200, 400, 200, 800)
                    setSound(alarmSoundUri, audioAttributes)
                    lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                }
                notificationManager.createNotificationChannel(channel)
            }

            val launchIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                alarmId,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val builder = NotificationCompat.Builder(context, channelId)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)

            notificationManager.notify(alarmId, builder.build())
        } catch (_: Exception) {}
    }
}
