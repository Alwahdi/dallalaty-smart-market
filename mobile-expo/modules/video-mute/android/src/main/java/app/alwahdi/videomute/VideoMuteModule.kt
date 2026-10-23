package app.alwahdi.videomute

import android.media.MediaExtractor
import android.media.MediaMuxer
import android.media.MediaCodec
import android.media.MediaFormat
import android.media.MediaMetadataRetriever
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.nio.ByteBuffer

class VideoMuteModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VideoMute")
    AsyncFunction("stripAudio") { source: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("No application context")
      val uri = Uri.parse(source)
      val output = File.createTempFile("muted-", ".mp4", context.cacheDir)
      val extractor = MediaExtractor()
      var muxer: MediaMuxer? = null
      var started = false
      var success = false
      try {
        extractor.setDataSource(context, uri, null)
        val track = (0 until extractor.trackCount).firstOrNull { extractor.getTrackFormat(it).getString(MediaFormat.KEY_MIME)?.startsWith("video/") == true }
          ?: throw IllegalArgumentException("No supported video track")
        extractor.selectTrack(track)
        val format = extractor.getTrackFormat(track)
        val writer = MediaMuxer(output.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        muxer = writer
        val retriever = MediaMetadataRetriever()
        try {
          retriever.setDataSource(context, uri)
          val rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull()
          if (rotation != null && rotation in listOf(0,90,180,270)) writer.setOrientationHint(rotation)
        } finally { retriever.release() }
        val target = writer.addTrack(format)
        writer.start(); started = true
        val initialSize = if(format.containsKey(MediaFormat.KEY_MAX_INPUT_SIZE)) format.getInteger(MediaFormat.KEY_MAX_INPUT_SIZE) else 4 * 1024 * 1024
        var buffer = ByteBuffer.allocateDirect(initialSize.coerceAtLeast(4 * 1024 * 1024))
        val info = MediaCodec.BufferInfo()
        var samples = 0
        while (extractor.sampleTime >= 0) {
          val size = extractor.sampleSize
          if (size > 64 * 1024 * 1024) throw IllegalArgumentException("Video sample is too large")
          if (size > buffer.capacity()) buffer = ByteBuffer.allocateDirect(size.toInt())
          buffer.clear()
          val count = extractor.readSampleData(buffer, 0)
          if (count < 0) break
          info.set(0, count, extractor.sampleTime, if((extractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC) != 0) MediaCodec.BUFFER_FLAG_KEY_FRAME else 0)
          writer.writeSampleData(target, buffer, info)
          samples++
          if (!extractor.advance()) break
        }
        if(samples == 0) throw IllegalArgumentException("Empty video")
        writer.stop(); started = false
        val verify = MediaExtractor()
        try {
          verify.setDataSource(output.absolutePath)
          if(verify.trackCount != 1 || verify.getTrackFormat(0).getString(MediaFormat.KEY_MIME)?.startsWith("video/") != true) throw IllegalStateException("Audio removal verification failed")
        } finally { verify.release() }
        success = true
        Uri.fromFile(output).toString()
      } finally {
        extractor.release()
        if(started) try { muxer?.stop() } catch (_: Exception) {}
        muxer?.release()
        if(!success) output.delete()
      }
    }
  }
}