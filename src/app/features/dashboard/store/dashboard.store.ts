import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { IDashboardInitialState } from "../interface";
import { initialDashboardState } from "../constants";
import { withDevtools } from "../../../core/store/devtools";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, switchMap, tap } from "rxjs";
import { DashboardService } from "../../../core/services/dashboard.service";

export const dashboardStore = signalStore({ providedIn: "root" },

    withDevtools("dashboardStore"),
    withState<IDashboardInitialState>(initialDashboardState),

    withMethods((store, dashboardService = inject(DashboardService)) => ({
        getDashboardData: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(() => dashboardService.getDashboardDetails().pipe(
                    tap((response) => {
                        patchState(store, { ...response, isLoading: false });
                    }),
                    catchError((err) => {
                        console.error('Failed to load dashboard details:', err);
                        patchState(store, { isLoading: false });
                        return of(null);
                    })
                ))
            )
        )
    }))
)