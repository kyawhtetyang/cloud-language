from __future__ import annotations

import unittest

from app.services.lessons import sort_lessons_by_numeric_level_unit


class LessonsSortingTest(unittest.TestCase):
    def test_sorts_by_numeric_level_then_unit(self) -> None:
        rows = [
            {"level": 1, "unit": 10, "topic": "u10"},
            {"level": 1, "unit": 2, "topic": "u2"},
            {"level": 2, "unit": 1, "topic": "l2u1"},
            {"level": 1, "unit": 1, "topic": "u1"},
        ]

        sorted_rows = sort_lessons_by_numeric_level_unit(rows)
        sorted_keys = [(row["level"], row["unit"]) for row in sorted_rows]

        self.assertEqual(sorted_keys, [(1, 1), (1, 2), (1, 10), (2, 1)])

    def test_uses_canonical_order_index_and_unit_id_when_present(self) -> None:
        rows = [
            {"orderIndex": 1, "unitId": 10, "level": 9, "unit": 9},
            {"orderIndex": 1, "unitId": 2, "level": 9, "unit": 9},
            {"orderIndex": 1, "unitId": 1, "level": 9, "unit": 9},
        ]

        sorted_rows = sort_lessons_by_numeric_level_unit(rows)
        sorted_keys = [(row["orderIndex"], row["unitId"]) for row in sorted_rows]

        self.assertEqual(sorted_keys, [(1, 1), (1, 2), (1, 10)])


if __name__ == "__main__":
    unittest.main()

