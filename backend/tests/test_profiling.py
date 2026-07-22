import io


def test_profile_detects_correct_types(client, auth_headers):
    file_content = b"name,revenue\nAlice,1000\nBob,2000\nCarol,1500"
    upload_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("profile_test.csv", io.BytesIO(file_content), "text/csv")},
        headers=auth_headers,
    )
    dataset_id = upload_res.json()["id"]

    profile_res = client.get(f"/api/v1/datasets/{dataset_id}/profile", headers=auth_headers)
    assert profile_res.status_code == 200

    data = profile_res.json()
    assert data["row_count"] == 3
    assert data["quality_score"] > 0

    columns_by_name = {c["name"]: c for c in data["columns"]}
    assert columns_by_name["name"]["inferred_type"] == "categorical"
    assert columns_by_name["revenue"]["inferred_type"] == "numeric"


def test_profile_detects_missing_values(client, auth_headers):
    file_content = b"name,revenue\nAlice,1000\nBob,\nCarol,1500"
    upload_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("missing_test.csv", io.BytesIO(file_content), "text/csv")},
        headers=auth_headers,
    )
    dataset_id = upload_res.json()["id"]

    profile_res = client.get(f"/api/v1/datasets/{dataset_id}/profile", headers=auth_headers)
    data = profile_res.json()
    revenue_col = next(c for c in data["columns"] if c["name"] == "revenue")
    assert revenue_col["missing_count"] == 1