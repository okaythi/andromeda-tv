#[cfg(target_os = "windows")]
unsafe extern "system" fn subclass_proc(
    hwnd: windows_sys::Win32::Foundation::HWND,
    msg: u32,
    wparam: windows_sys::Win32::Foundation::WPARAM,
    lparam: windows_sys::Win32::Foundation::LPARAM,
    id: usize,
    _data: usize,
) -> windows_sys::Win32::Foundation::LRESULT {
    use windows_sys::Win32::UI::Shell::{DefSubclassProc, RemoveWindowSubclass};
    use windows_sys::Win32::UI::WindowsAndMessaging::*;

    match msg {
        WM_SIZING => {
            let rect = lparam as *mut windows_sys::Win32::Foundation::RECT;
            if !rect.is_null() {
                let width = (*rect).right - (*rect).left;
                let height = (*rect).bottom - (*rect).top;
                let aspect_ratio = 16.0 / 9.0;

                let edge = wparam as u32;
                match edge {
                    WMSZ_LEFT | WMSZ_RIGHT => {
                        let target_height = (width as f64 / aspect_ratio).round() as i32;
                        (*rect).bottom = (*rect).top + target_height;
                    }
                    WMSZ_TOP | WMSZ_BOTTOM => {
                        let target_width = (height as f64 * aspect_ratio).round() as i32;
                        (*rect).right = (*rect).left + target_width;
                    }
                    WMSZ_TOPLEFT | WMSZ_TOPRIGHT => {
                        let target_height = (width as f64 / aspect_ratio).round() as i32;
                        (*rect).top = (*rect).bottom - target_height;
                    }
                    WMSZ_BOTTOMLEFT | WMSZ_BOTTOMRIGHT => {
                        let target_height = (width as f64 / aspect_ratio).round() as i32;
                        (*rect).bottom = (*rect).top + target_height;
                    }
                    _ => {}
                }
            }
            1
        }
        WM_NCDESTROY => {
            RemoveWindowSubclass(hwnd, Some(subclass_proc), id);
            DefSubclassProc(hwnd, msg, wparam, lparam)
        }
        _ => DefSubclassProc(hwnd, msg, wparam, lparam),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                use tauri::Manager;
                for (_label, window) in app.webview_windows() {
                    if let Ok(hwnd) = window.hwnd() {
                        unsafe {
                            windows_sys::Win32::UI::Shell::SetWindowSubclass(
                                hwnd.0 as _,
                                Some(subclass_proc),
                                1001,
                                0,
                            );
                        }
                    }
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
