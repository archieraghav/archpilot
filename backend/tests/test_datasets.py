import io


def test_upload_requires_auth(client):
    file_content = b"name,value\nA,1\nB,2"
    res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("test.csv", io.BytesIO(file_content), "text/csv")},
    )
    assert res.status_code == 401


def test_upload_rejects_invalid_extension(client, auth_headers):
    file_content = b"not a real dataset"
    res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_upload_and_list_dataset(client, auth_headers):
    file_content = b"name,value\nA,1\nB,2\nC,3"
    upload_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("pytest_data.csv", io.BytesIO(file_content), "text/csv")},
        headers=auth_headers,
    )
    assert upload_res.status_code == 201
    assert upload_res.json()["row_count"] == 3

    list_res = client.get("/api/v1/datasets", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(d["original_filename"] == "pytest_data.csv" for d in list_res.json())


def test_delete_dataset(client, auth_headers):
    file_content = b"name,value\nA,1"
    upload_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("to_delete.csv", io.BytesIO(file_content), "text/csv")},
        headers=auth_headers,
    )
    dataset_id = upload_res.json()["id"]

    delete_res = client.delete(f"/api/v1/datasets/{dataset_id}", headers=auth_headers)
    assert delete_res.status_code == 204

    get_res = client.get(f"/api/v1/datasets/{dataset_id}", headers=auth_headers)
    assert get_res.status_code == 404