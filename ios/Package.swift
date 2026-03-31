// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LumioApp",
    platforms: [
        .iOS(.v16)
    ],
    dependencies: [
        .package(
            url: "https://github.com/firebase/firebase-ios-sdk",
            from: "11.0.0"
        )
    ],
    targets: [
        .executableTarget(
            name: "LumioApp",
            dependencies: [
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
            ],
            path: "Sources/LumioApp",
            resources: [
                .process("../../GoogleService-Info.plist")
            ]
        )
    ]
)
