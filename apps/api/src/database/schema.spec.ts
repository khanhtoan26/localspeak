import { getTableConfig } from "drizzle-orm/pg-core";
import { savedAnalysisSessions, savedSessionInputModeEnum } from "./schema";

describe("database schema", () => {
  it("exports the saved analysis sessions table", () => {
    const table = getTableConfig(savedAnalysisSessions);
    const columnNames = table.columns.map((column) => column.name);

    expect(table.name).toBe("saved_analysis_sessions");
    expect(columnNames).toEqual(
      expect.arrayContaining([
        "id",
        "owner_key",
        "user_id",
        "input_mode",
        "title",
        "reference_text",
        "pronunciation_band",
        "fluency_band",
        "wpm",
        "input_metadata",
        "metrics",
        "feedback",
        "created_at",
        "updated_at",
      ]),
    );
    expect(table.indexes).toHaveLength(2);
  });

  it("exports the saved session input mode enum", () => {
    expect(savedSessionInputModeEnum.enumName).toBe("saved_session_input_mode");
    expect(savedSessionInputModeEnum.enumValues).toEqual(["json", "audio"]);
  });
});
