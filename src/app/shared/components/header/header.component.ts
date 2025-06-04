import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  userName: string | null = '';
  userRole: string | null = '';
  fotoPerfil: string | null = '';
  showDropdown: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.isAuthenticated) {
      this.authService.fetchUserInfo().subscribe(
        userInfo => {
          this.userName = userInfo.username;
          this.userRole = userInfo.groups?.[0] || 'Sin rol';
          this.fotoPerfil = userInfo.foto_perfil
            ? `http://localhost:8000${userInfo.foto_perfil}`
            : null;
        },
        error => {
          console.error('Error fetching user info:', error);
        }
      );
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }

  logout() {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
