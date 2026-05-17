import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let output = root.appendingPathComponent("store-assets", isDirectory: true)
var canvasHeight: CGFloat = 0

func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
    NSColor(
        calibratedRed: CGFloat((hex >> 16) & 0xff) / 255,
        green: CGFloat((hex >> 8) & 0xff) / 255,
        blue: CGFloat(hex & 0xff) / 255,
        alpha: alpha
    )
}

func roundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor, stroke: NSColor? = nil, lineWidth: CGFloat = 1) {
    let converted = NSRect(x: rect.minX, y: canvasHeight - rect.minY - rect.height, width: rect.width, height: rect.height)
    let path = NSBezierPath(roundedRect: converted, xRadius: radius, yRadius: radius)
    fill.setFill()
    path.fill()
    if let stroke {
        stroke.setStroke()
        path.lineWidth = lineWidth
        path.stroke()
    }
}

func text(_ value: String, x: CGFloat, y: CGFloat, size: CGFloat, weight: NSFont.Weight, fill: NSColor, align: NSTextAlignment = .left) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = align
    let attrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: size, weight: weight),
        .foregroundColor: fill,
        .paragraphStyle: paragraph
    ]
    let width: CGFloat = align == .center ? 900 : 700
    NSString(string: value).draw(in: NSRect(x: x, y: canvasHeight - y - size * 1.2, width: width, height: size * 1.4), withAttributes: attrs)
}

func centeredText(_ value: String, centerX: CGFloat, y: CGFloat, size: CGFloat, weight: NSFont.Weight, fill: NSColor) {
    text(value, x: centerX - 450, y: y, size: size, weight: weight, fill: fill, align: .center)
}

func savePNG(name: String, width: CGFloat, height: CGFloat, draw: () -> Void) throws {
    let image = NSImage(size: NSSize(width: width, height: height))
    image.lockFocus()
    NSGraphicsContext.current?.imageInterpolation = .high
    canvasHeight = height
    draw()
    image.unlockFocus()

    guard
        let tiff = image.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiff),
        let png = bitmap.representation(using: .png, properties: [:])
    else {
        throw NSError(domain: "timepill.assets", code: 1)
    }

    try png.write(to: output.appendingPathComponent(name))
}

func dot(_ x: CGFloat, _ y: CGFloat, _ radius: CGFloat, fill: NSColor) {
    fill.setFill()
    NSBezierPath(ovalIn: NSRect(x: x - radius, y: canvasHeight - y - radius, width: radius * 2, height: radius * 2)).fill()
}

func line(_ start: NSPoint, _ end: NSPoint, stroke: NSColor, width: CGFloat = 1) {
    let path = NSBezierPath()
    path.move(to: NSPoint(x: start.x, y: canvasHeight - start.y))
    path.line(to: NSPoint(x: end.x, y: canvasHeight - end.y))
    stroke.setStroke()
    path.lineWidth = width
    path.stroke()
}

try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

try savePNG(name: "small-promo-440x280.png", width: 440, height: 280) {
    color(0xEEEFF1).setFill()
    NSRect(x: 0, y: 0, width: 440, height: 280).fill()
    roundedRect(NSRect(x: 34, y: 42, width: 372, height: 196), radius: 30, fill: color(0xFCFCFD))
    roundedRect(NSRect(x: 58, y: 67, width: 324, height: 48), radius: 24, fill: .white, stroke: color(0xD8D8DE))
    text("9 AM PST", x: 82, y: 80, size: 17, weight: .medium, fill: color(0x7A7A7D))
    dot(174, 91, 2.5, fill: color(0x9B9BA0))
    text("6 PM CET", x: 194, y: 80, size: 17, weight: .semibold, fill: color(0x171923))
    centeredText("timepill", centerX: 220, y: 138, size: 42, weight: .heavy, fill: color(0x050505))
    roundedRect(NSRect(x: 158, y: 190, width: 124, height: 20), radius: 10, fill: color(0x8B46FF, 0.16))
}

try savePNG(name: "screenshot-inline-1280x800.png", width: 1280, height: 800) {
    color(0xF7F7F8).setFill()
    NSRect(x: 0, y: 0, width: 1280, height: 800).fill()
    roundedRect(NSRect(x: 120, y: 92, width: 1040, height: 616), radius: 28, fill: .white, stroke: color(0xDFE3E8))
    text("Messages", x: 180, y: 140, size: 28, weight: .semibold, fill: color(0x6C7A89))
    line(NSPoint(x: 180, y: 210), NSPoint(x: 1100, y: 210), stroke: color(0xEDF0F3))
    roundedRect(NSRect(x: 594, y: 254, width: 426, height: 76), radius: 38, fill: color(0x1D9BF0))
    text("Can do 9 AM PST", x: 632, y: 278, size: 28, weight: .medium, fill: .white)
    roundedRect(NSRect(x: 212, y: 414, width: 706, height: 128), radius: 36, fill: color(0xEEF1F4))
    text("Would either of these times (PST) work?", x: 252, y: 438, size: 28, weight: .medium, fill: color(0x101820))
    text("- 9-9:30 AM", x: 252, y: 480, size: 28, weight: .medium, fill: color(0x101820))
    text("- 11-11:30 AM", x: 252, y: 522, size: 28, weight: .medium, fill: color(0x101820))
    roundedRect(NSRect(x: 200, y: 348, width: 620, height: 58), radius: 29, fill: .white, stroke: color(0xE1E3E8))
    text("6 PM - 6:30 PM CET", x: 236, y: 366, size: 22, weight: .medium, fill: color(0x737373))
    dot(504, 377, 3, fill: color(0xA8A8A8))
    text("8 PM - 8:30 PM CET", x: 526, y: 366, size: 22, weight: .semibold, fill: color(0x171923))
    centeredText("timepill", centerX: 640, y: 638, size: 44, weight: .heavy, fill: color(0x050505))
}

try savePNG(name: "screenshot-settings-1280x800.png", width: 1280, height: 800) {
    color(0xE6E6E7).setFill()
    NSRect(x: 0, y: 0, width: 1280, height: 800).fill()
    roundedRect(NSRect(x: 430, y: 96, width: 420, height: 610), radius: 48, fill: color(0xFCFCFD), stroke: color(0xD8D8DE))
    roundedRect(NSRect(x: 452, y: 118, width: 376, height: 182), radius: 30, fill: .white, stroke: color(0xD8D8DE))
    text("Convert to", x: 486, y: 148, size: 24, weight: .medium, fill: color(0x858585))
    text("Amsterdam CET", x: 618, y: 148, size: 24, weight: .medium, fill: color(0x050505))
    line(NSPoint(x: 782, y: 166), NSPoint(x: 794, y: 178), stroke: color(0x050505), width: 5)
    line(NSPoint(x: 794, y: 178), NSPoint(x: 806, y: 166), stroke: color(0x050505), width: 5)
    line(NSPoint(x: 486, y: 218), NSPoint(x: 794, y: 218), stroke: color(0xEDEDEE), width: 2)
    text("24-hour time", x: 486, y: 244, size: 26, weight: .medium, fill: color(0x858585))
    roundedRect(NSRect(x: 742, y: 236, width: 56, height: 32), radius: 16, fill: color(0xD8D8DC))
    dot(758, 252, 13, fill: .white)
    centeredText("Select any text with the timezone", centerX: 640, y: 386, size: 22, weight: .medium, fill: color(0x858585))
    centeredText("to convert it inline.", centerX: 640, y: 420, size: 22, weight: .medium, fill: color(0x858585))
    centeredText("timepill", centerX: 640, y: 532, size: 46, weight: .heavy, fill: color(0x050505))
    centeredText("Follow on X (Twitter)", centerX: 640, y: 594, size: 24, weight: .medium, fill: color(0x858585))
}
