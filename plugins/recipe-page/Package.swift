// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Guat2itRecipePage",
    platforms: [.iOS(.v15)],
    products: [.library(name: "Guat2itRecipePage", targets: ["RecipePagePlugin"])],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "RecipePagePlugin",
            dependencies: [.product(name: "Capacitor", package: "capacitor-swift-pm")],
            path: "ios/Sources/RecipePagePlugin"
        )
    ]
)
