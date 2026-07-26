import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IDashboardInitialState } from "../../features/dashboard/interface";
import { BASE_BACKEND_URL } from "../../../enviroment/enviroment";

@Injectable({ providedIn: "root" })

export class DashboardService {
    private baseUrl = `${BASE_BACKEND_URL}/api/dashboard`
    constructor(private http: HttpClient) { }

    getDashboardDetails() {
        return this.http.get<IDashboardInitialState>(`${this.baseUrl}`);
    }
}