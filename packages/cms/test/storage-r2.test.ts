import { describe, expect, it, vi } from "vite-plus/test";
import { r2, getR2Bucket, listR2Files, uploadR2File, deleteR2File } from "../src/storage/index";

describe("CMS R2 Storage Adapter", () => {
  it("should generate correct storage configuration with r2 helper", () => {
    const config = r2({
      binding: "MEDIA_BUCKET",
      publicUrl: "https://media.rimelight.com",
      prefix: "uploads/",
    });
    expect(config.provider).toBe("r2");
    expect(config.binding).toBe("MEDIA_BUCKET");
    expect(config.publicUrl).toBe("https://media.rimelight.com");
    expect(config.prefix).toBe("uploads/");
  });

  it("should fallback to defaults when options omitted", () => {
    const config = r2();
    expect(config.provider).toBe("r2");
    expect(config.binding).toBe("BLOB");
    expect(config.prefix).toBe("media/");
  });

  it("should extract bucket from locals runtime env", async () => {
    const mockBucket = { list: vi.fn(), put: vi.fn() };
    const locals = {
      runtime: {
        env: {
          BLOB: mockBucket,
        },
      },
    };
    expect(await getR2Bucket(locals, "BLOB")).toBe(mockBucket);
  });

  it("should list files and map URLs properly", async () => {
    const mockBucket = {
      list: vi.fn().mockResolvedValue({
        objects: [
          {
            key: "media/photo.jpg",
            size: 1024,
            httpMetadata: { contentType: "image/jpeg" },
            uploaded: new Date("2026-08-20T12:00:00Z"),
            etag: "etag123",
          },
        ],
        truncated: false,
      }),
    };

    const res = await listR2Files(mockBucket, {
      prefix: "media/",
      publicUrl: "https://cdn.example.com",
    });

    expect(res.files).toHaveLength(1);
    expect(res.files[0]!.key).toBe("media/photo.jpg");
    expect(res.files[0]!.name).toBe("photo.jpg");
    expect(res.files[0]!.url).toBe("https://cdn.example.com/media/photo.jpg");
    expect(res.files[0]!.mimeType).toBe("image/jpeg");
    expect(res.files[0]!.size).toBe(1024);
  });

  it("should upload file to R2 with correct metadata", async () => {
    const mockPut = vi.fn().mockResolvedValue({ etag: "upload_etag" });
    const mockBucket = { put: mockPut };

    const file = new File(["test content"], "document.pdf", { type: "application/pdf" });
    const uploaded = await uploadR2File(mockBucket, file, {
      prefix: "media/",
      publicUrl: "https://cdn.example.com",
    });

    expect(mockPut).toHaveBeenCalled();
    expect(uploaded.mimeType).toBe("application/pdf");
    expect(uploaded.url.startsWith("https://cdn.example.com/media/")).toBe(true);
  });

  it("should delete file from R2", async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    const mockBucket = { delete: mockDelete };

    const deleted = await deleteR2File(mockBucket, "media/file.png");
    expect(deleted).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith("media/file.png");
  });
});
