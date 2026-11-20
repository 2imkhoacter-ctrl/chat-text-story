import unittest
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('alignment', Path(__file__).with_name('align-v4a1.py'))
alignment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alignment)

class AlignmentTests(unittest.TestCase):
    def test_accents_preserved(self):
        self.assertNotEqual(alignment.tokens('đỗ'), alignment.tokens('độ'))
        self.assertEqual(alignment.tokens('Tâm ƠI!'), ['tâm', 'ơi'])

    def test_numeric_matching_does_not_rewrite_text(self):
        self.assertEqual(alignment.tokens('200'), alignment.tokens('hai trăm'))
        self.assertEqual(alignment.tokens('500k'), alignment.tokens('năm trăm nghìn'))
        self.assertEqual(alignment.tokens('200k'), alignment.tokens('200 ngàn'))

    def test_repeated_laughter_spacing(self):
        self.assertEqual(alignment.tokens('HA HA HA HA'), alignment.tokens('Hahahaha'))

    def test_repeated_words_keep_order(self):
        target = ['không', 'anh', 'không', 'em']
        observed = ['không', 'anh', 'ừ', 'không', 'em']
        mapped = alignment.ordered_mapping(target, observed)
        self.assertEqual([mapped[i][0] for i in range(4)], [0, 1, 3, 4])

    def test_missing_words_are_not_invented(self):
        mapped = alignment.ordered_mapping(['anh', 'đang', 'đi', 'làm'], ['anh', 'làm'])
        self.assertEqual(len(mapped), 2)
        self.assertNotIn(1, mapped)
        self.assertNotIn(2, mapped)

if __name__ == '__main__':
    unittest.main()
