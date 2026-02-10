import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../utils/themeSlice";
import { Palette } from "lucide-react";

const ThemeSwitcher = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((store) => store.theme);

  const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
    "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
    "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
    "night", "coffee", "winter", "dim", "nord", "sunset"
  ];

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle"
        aria-label="Change Theme"
      >
        <Palette size={20} />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-xl bg-base-200 rounded-box w-52 max-h-96 overflow-y-auto z-[999]"
      >
        {themes.map((theme) => (
          <li key={theme}>
            <button
              className={`${currentTheme === theme ? "active" : ""}`}
              onClick={() => dispatch(setTheme(theme))}
            >
              <span className="capitalize">{theme}</span>
              {currentTheme === theme && (
                <span className="badge badge-primary badge-sm">✓</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSwitcher;