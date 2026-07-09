import { beforeEach, describe, expect, it, vi } from "vitest";
import { databases } from "../../appwrite/config";
import { novelRepository } from "../appwriteNovelRepository";

// Mock the databases module
vi.mock("../../appwrite/config", () => ({
  databases: {
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
  },
  COLLECTIONS: {
    NOVELS: "novels",
  },
  DATABASE_ID: "test-db",
}));

describe("NovelRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllNovels", () => {
    it("should return novels when successful", async () => {
      const mockNovels = [
        {
          $id: "1",
          title: "Test Novel 1",
          isDeleted: false,
          status: "published",
        },
        {
          $id: "2",
          title: "Test Novel 2",
          isDeleted: false,
          status: "published",
        },
      ];
      (databases.listDocuments as any).mockResolvedValue({
        documents: mockNovels,
      });

      const result = await novelRepository.getAllNovels();

      expect(databases.listDocuments).toHaveBeenCalledWith(
        "test-db",
        "novels",
        expect.arrayContaining([
          expect.objectContaining({ method: "equal" }),
          expect.objectContaining({ method: "equal" }),
        ]),
      );
      expect(result).toEqual(mockNovels);
    });

    it("should return empty array on error", async () => {
      (databases.listDocuments as any).mockRejectedValue(
        new Error("API Error"),
      );

      const result = await novelRepository.getAllNovels();

      expect(result).toEqual([]);
    });
  });

  describe("getNovelById", () => {
    it("should return novel when found", async () => {
      const mockNovel = { $id: "1", title: "Test Novel" };
      (databases.getDocument as any).mockResolvedValue(mockNovel);

      const result = await novelRepository.getNovelById("1");

      expect(databases.getDocument).toHaveBeenCalledWith(
        "test-db",
        "novels",
        "1",
      );
      expect(result).toEqual(mockNovel);
    });

    it("should return null on error", async () => {
      (databases.getDocument as any).mockRejectedValue(new Error("Not found"));

      const result = await novelRepository.getNovelById("1");

      expect(result).toBeNull();
    });
  });

  describe("createNovel", () => {
    it("should create novel successfully", async () => {
      const mockNovel = { $id: "1", title: "New Novel" };
      (databases.createDocument as any).mockResolvedValue(mockNovel);

      const result = await novelRepository.createNovel({
        title: "New Novel",
      } as any);

      expect(databases.createDocument).toHaveBeenCalledWith(
        "test-db",
        "novels",
        "unique()",
        expect.objectContaining({
          title: "New Novel",
          isDeleted: false,
        }),
      );
      expect(result).toEqual(mockNovel);
    });
  });

  describe("updateNovel", () => {
    it("should update novel successfully", async () => {
      const mockNovel = { $id: "1", title: "Updated Novel" };
      (databases.updateDocument as any).mockResolvedValue(mockNovel);

      const result = await novelRepository.updateNovel("1", {
        title: "Updated Novel",
      } as any);

      expect(databases.updateDocument).toHaveBeenCalledWith(
        "test-db",
        "novels",
        "1",
        expect.objectContaining({
          title: "Updated Novel",
        }),
      );
      expect(result).toEqual(mockNovel);
    });
  });

  describe("deleteNovel", () => {
    it("should soft delete novel", async () => {
      (databases.updateDocument as any).mockResolvedValue({});

      await novelRepository.deleteNovel("1");

      expect(databases.updateDocument).toHaveBeenCalledWith(
        "test-db",
        "novels",
        "1",
        expect.objectContaining({
          isDeleted: true,
        }),
      );
    });
  });
});
