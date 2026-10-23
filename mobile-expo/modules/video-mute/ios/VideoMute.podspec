Pod::Spec.new do |s|
  s.name = 'VideoMute'
  s.version = '1.0.0'
  s.summary = 'Video-only export for Matjer Ibb'
  s.description = s.summary
  s.author = 'Alwahdi'
  s.homepage = 'https://matjer-ibb.lovable.app'
  s.license = 'MIT'
  s.platforms = { :ios => '16.0' }
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'AVFoundation'
  s.swift_version = '5.9'
  s.source_files = '**/*.{h,m,mm,swift}'
end