## Micro-Service for Summary Statistics on Dataset

This micro-service provides functionality to derive simplified summary statistics (mean, min, max) on a dataset. The dataset contains records with information such as salary, department, sub-department and whether the employee is on contract or not.

### Functionality

The service offers several APIs to interact with the dataset:

1. **Add Record:** Add a new record to the dataset.
2. **Delete Record:** Delete a specific record from the dataset.
3. **Update Record:** Update a specific record from the dataset.
4. **Get Overall Salary Statistics:** Retrieve summary statistics (mean, min, max) for all salaries in the dataset in desired currency.
6. **Get Contracted Employee Salary Statistics:** Retrieve summary statistics (mean, min, max) for salaries of employees with "on_contract": "true".
6. **Get Salary Statistics by Department:** Retrieve summary statistics (mean, min, max) for salaries grouped by department.
7. **Get Salary Statistics by Department and Sub-Department:** Retrieve summary statistics (mean, min, max) for salaries grouped by department and sub-department (nested aggregation).
8. **Authentication:** Authenticaion service is implemented based on cookies with JWT token with a dummy user.

### Implementation Notes

* You must be authenticated to access any feature of the API.
* This API is build with NodeJS, JavaScript, Express and in-memory database for simplicity.

## Installation & Starting service

1. After unziping this code, run `npm i`
2. To start the service run `npm run start`. This will start the ss-service at default port, **5873** on **localhost**.
3. You can configure port from **.env** file.

## API Usage

**Default base URL:** `http://localhost:5873/api/v1`

**API Response Format:** 
```bash
{
    "statusCode": # response status code,
    "data": {
        # response data
    },
    "messege": # response messege,
    "success": true
}
```

**API Error Format:** 
```bash
{
    "success": false,
    "message": # error messege,
    "error": [ 
        # array of errors 
    ],
    "stack": # stack trace of the error
}
```

**Dummy user for authentication:** 
```bash
users = {
    "admin" : {
        "name": "admin",
        "password": "1234" # hashed in database
    }
}
```

### 1. Login as user- (admin)

- **Method**: POST
- **Endpoint**: `/users/login`
- **Request Body**: Type- json

    ```json
    {
        "name": "admin",
        "password": "1234"
    }
    ```

### 2. Create a record

- **Method**: POST
- **Endpoint**: `/users/create-record`
- **Request Body**: Type- json

    ```json
    {
        "name": "Sachida",
        "salary": 250000,
        "currency": "USD",
        "department": "Engineering",
        "sub_department": "Backend"
    }
    ```
- This will create a new record with this dataset. Also the given dataset is already in the database.

- **Response data**: Type: json, `record_id` is auto generated and unique for a record.
    ```json
    {
    "statusCode": 201,
    "data": {
        "name": "Sachida",
        "salary": 250000,
        "currency": "USD",
        "department": "Engineering",
        "sub_department": "Backend",
        "record_id": 10
    },
    "messege": "Record created successfully",
    "success": true
    }
    ```

### 2. Update a record

- **Method**: POST
- **Endpoint**: `/users/update-record`
- **Request Body**: Type- json

    ```json
    {
        "record_id": 10,
        "name": "Sachida",
        "salary": 300000,
        "currency": "EUR",
        "department": "Engineering",
        "sub_department": "Backend"
    }
    ```
- This will update if record with this record_id is present in the database.

- **Response data**: Type: json
    ```json
    {
    "statusCode": 201,
    "data": {
        "name": "Sachida",
        "salary": 300000,
        "currency": "EUR",
        "department": "Engineering",
        "sub_department": "Backend",
        "record_id": 10
    },
    "messege": "Record updated successfully",
    "success": true
    }
    ```

### 3. Delete a record

- **Method**: POST
- **Endpoint**: `/users/delete-record`
- **Request Body**: Type- json

    ```json
    {
        "record_id": "10",
        "name": "Sachida"
    }
    ```
- This will delete if record with this record_id or name is present in the database, if both are present record it will bw given priority.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "record_id": "10"
    },
    "messege": "Record deleted successfully",
    "success": true
    }
    ```


### 4. Get the overall summary statistics of records

- **Method**: GET
- **Endpoint**: `/users/get-ss`
- This will return you the SS of entire record's datbase.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "USD",
        "min": 30,
        "max": 200000000,
        "mean": 339514.28106416116
    },
    "messege": "Summary Statistics fetched successfully",
    "success": true
    }
    ```

### 5. Get the overall summary statistics with queries

- **Method**: GET
- **Endpoint**: `/users/get-ss?currency=inr&on_contract=true`
- Supported currencies are `USD`, `EUR` and `INR`. With `currency` param you can get SS in desired currency.
- You can filter the SS for only active contracts by using `on_contract=true` query.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "INR",
        "min": 7512300,
        "max": 9181700,
        "mean": 8347000
    },
    "messege": "Summary Statistics fetched successfully",
    "success": true
    }
    ```

### 6. Get the department wise summary statistics of records

- **Method**: GET
- **Endpoint**: `/users/get-departmental-ss`
- This will return you the SS of records categorised based on there department.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "USD",
        "stats": {
            "Engineering": {
                "min": 30,
                "max": 2396070.4444710673,
                "mean": 578220.0888942134,
                "noOfRecords": 5
            },
            "Banking": {
                "min": 90000,
                "max": 90000,
                "mean": 90000,
                "noOfRecords": 1
            },
            "Operations": {
                "min": 30,
                "max": 74468.08510638298,
                "mean": 37249.04255319149,
                "noOfRecords": 2
            },
            "Administration": {
                "min": 30,
                "max": 30,
                "mean": 30,
                "noOfRecords": 1
            }
        }
    },
    "messege": "Departmental Summary Statistics fetched successfully",
    "success": true
    }
    ```

### 7. Get the department wise summary statistics of records with queries

- **Method**: GET
- **Endpoint**: `/users/get-departmental-ss?currency=inr&on_contract=true`
- Supported currencies are `USD`, `EUR` and `INR`. With `currency` param you can get SS in desired currency.
- You can filter the SS for only active contracts by using `on_contract=true` query.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "INR",
        "stats": {
            "Engineering": {
                "min": 9181700,
                "max": 9181700,
                "mean": 9181700,
                "noOfRecords": 1
            },
            "Banking": {
                "min": 7512300,
                "max": 7512300,
                "mean": 7512300,
                "noOfRecords": 1
            }
        }
    },
    "messege": "Departmental Summary Statistics fetched successfully",
    "success": true
    }
    ```
### 8. Get the SS based on sub-department of records

- **Method**: GET
- **Endpoint**: `/users/get-subdepartmental-ss`
- This will return you the SS of records categorised based on there sub-department in a department.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "USD",
        "stats": {
            "Engineering": {
                "Platform": {
                    "min": 30,
                    "max": 2396070.4444710673,
                    "total": 2891100.4444710673,
                    "mean": 578220.0888942134,
                    "noOfRecords": 5
                }
            },
            "Banking": {
                "Loan": {
                    "min": 90000,
                    "max": 90000,
                    "total": 90000,
                    "mean": 90000,
                    "noOfRecords": 1
                }
            },
            "Operations": {
                "CustomerOnboarding": {
                    "min": 30,
                    "max": 74468.08510638298,
                    "total": 74498.08510638298,
                    "mean": 37249.04255319149,
                    "noOfRecords": 2
                }
            },
            "Administration": {
                "Agriculture": {
                    "min": 30,
                    "max": 30,
                    "total": 30,
                    "mean": 30,
                    "noOfRecords": 1
                }
            }
        }
    },
    "messege": "Sub-Departmental Summary Statistics fetched successfully",
    "success": true
    }
    ```

### 9. Get the SS based on sub-department of records with queries

- **Method**: GET
- **Endpoint**: `/users/get-subdepartmental-ss?currency=inr&on_contract=true`
- Same as above supported currencies are `USD`, `EUR` and `INR`. With `currency` query you can get SS in desired currency.
- You can filter the SS for only active contracts by using `on_contract=true` query.

- **Response data**: Type: json.
    ```json
    {
    "statusCode": 200,
    "data": {
        "currency": "INR",
        "stats": {
            "Banking": {
                "Loan": {
                    "min": 7512300,
                    "max": 7512300,
                    "total": 7512300,
                    "mean": 7512300,
                    "noOfRecords": 1
                }
            },
            "Engineering": {
                "Platform": {
                    "min": 9181700,
                    "max": 9181700,
                    "total": 9181700,
                    "mean": 9181700,
                    "noOfRecords": 1
                }
            }
        }
    },
    "messege": "Sub-Departmental Summary Statistics fetched successfully",
    "success": true
    }
    ```

### 10. Logout

- **Method**: POST
- **Endpoint**: `/users/logout`
- **Response**: Type- json

    ```json
    {
    "statusCode": 200,
    "data": {},
    "messege": "User logged out successfully",
    "success": true
    }
    ```
### Additional Notes

* If there is any bugs or something un-understandable, please ping me at navik09.me@gmail.com | sachidanan22@iitk.ac.in