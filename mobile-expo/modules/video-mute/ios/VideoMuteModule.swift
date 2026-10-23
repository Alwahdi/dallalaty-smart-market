import ExpoModulesCore
import AVFoundation

public class VideoMuteModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VideoMute")
    AsyncFunction("stripAudio") { (source: String) async throws -> String in
      guard let url = URL(string: source) else { throw NSError(domain: "VideoMute", code: 1) }
      let asset = AVURLAsset(url: url)
      guard let video = try await asset.loadTracks(withMediaType: .video).first else { throw NSError(domain: "VideoMute", code: 2) }
      let duration = try await asset.load(.duration)
      let composition = AVMutableComposition()
      guard let track = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else { throw NSError(domain: "VideoMute", code: 3) }
      try track.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: video, at: .zero)
      track.preferredTransform = try await video.load(.preferredTransform)
      guard let export = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else { throw NSError(domain: "VideoMute", code: 4) }
      let destination = FileManager.default.temporaryDirectory.appendingPathComponent("muted-\(UUID().uuidString).mp4")
      do {
        if #available(iOS 18.0, *) {
          try await export.export(to: destination, as: .mp4)
        } else {
          export.outputURL = destination
          export.outputFileType = .mp4
          await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            export.exportAsynchronously { continuation.resume() }
          }
          guard export.status == .completed else { throw export.error ?? NSError(domain: "VideoMute", code: 5) }
        }
        let result = AVURLAsset(url: destination)
        let audio = try await result.loadTracks(withMediaType: .audio)
        let videos = try await result.loadTracks(withMediaType: .video)
        guard audio.isEmpty && !videos.isEmpty else { throw NSError(domain: "VideoMute", code: 6) }
        return destination.absoluteString
      } catch {
        try? FileManager.default.removeItem(at: destination)
        throw error
      }
    }
  }
}