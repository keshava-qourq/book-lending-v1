import pytest
from pydantic import ValidationError

from app.routers.books import BookIn


def test_ac011_valid_and_trimmed() -> None:
    b = BookIn(title="  T ", author=" A ", total_copies=2)
    assert (b.title, b.author, b.total_copies) == ("T", "A", 2)


@pytest.mark.parametrize("copies", ["2", 2.5, True, 0, -1])
def test_ac011_rejects_bad_total_copies(copies) -> None:
    with pytest.raises(ValidationError) as e:
        BookIn(title="T", author="A", total_copies=copies)
    assert e.value.errors()[0]["loc"] == ("total_copies",)


@pytest.mark.parametrize("field", ["title", "author"])
def test_ac011_rejects_blank_text(field) -> None:
    data = {"title": "T", "author": "A", "total_copies": 1, field: "   "}
    with pytest.raises(ValidationError) as e:
        BookIn(**data)
    assert e.value.errors()[0]["loc"] == (field,)
