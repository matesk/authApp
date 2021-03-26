import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthResponse, User } from '../interfaces/auth.interfaces';
import { of, Observable } from 'rxjs';
import { element } from 'protractor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl: string = environment.baseUrl;

  private _user!: User;

  get user() {
    return { ...this._user };
  }

  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string) {
    const url = `${this.baseUrl}/auth/new`;
    const body = { name, email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({ ok, token }) => {
        if (ok) {
          localStorage.setItem('token', token!);
        }
      }),
      map((valid) => valid.ok),
      catchError((err) => of(err.error.msg))
    );
  }

  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap((resp) => {
        if (resp.ok) {
          localStorage.setItem('token', resp.token!);
        }
      }),
      map((valid) => valid.ok),
      catchError((err) => of(err.error.msg))
    );
  }

  validadToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders().set(
      'x-token',
      localStorage.getItem('token') || ''
    );

    return this.http
      .get<AuthResponse>(url, { headers })
      .pipe(
        map((resp) => {
          localStorage.setItem('token', resp.token!);
          this._user = {
            uid: resp.uid!,
            name: resp.name!,
            email: resp.email!,
          };
          return resp.ok;
        }),
        catchError(() => of(false))
      );
  }

  logout() {
    localStorage.clear();
    // localStorage.removeItem('token');
  }
}
