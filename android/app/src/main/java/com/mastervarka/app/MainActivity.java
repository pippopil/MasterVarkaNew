package com.mastervarka.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import com.mastervarka.app.plugins.MasterVarkaNativePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MasterVarkaNativePlugin.class);
        super.onCreate(savedInstanceState);

        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW);
                            intent.setData(Uri.parse(url));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception e) {
                            try {
                                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                                if (mimeType != null && !mimeType.isEmpty()) {
                                    request.setMimeType(mimeType);
                                }
                                request.addRequestHeader("User-Agent", userAgent);
                                request.setDescription("Скачивание обновления МастерВарка");
                                String filename = URLUtil.guessFileName(url, contentDisposition, mimeType);
                                request.setTitle(filename);
                                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);
                                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                                if (dm != null) {
                                    dm.enqueue(request);
                                    Toast.makeText(getApplicationContext(), "Началось скачивание " + filename, Toast.LENGTH_SHORT).show();
                                }
                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                        }
                    }
                });
            }
        } catch (Exception ignored) {}
    }
}
