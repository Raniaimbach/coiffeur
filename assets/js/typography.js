/**
 * Cleopatra Coiffeur Atelier - Luxury Typography Studio Engine
 * Provides 4 curated haute-couture typography pairings with instant live reactivity & persistence.
 */

const TYPOGRAPHY_PRESETS = {
  paris: {
    id: "paris",
    name: "Parisian Haute Couture",
    badge: "Empfehlung · Haute Couture",
    serif: "'Cormorant Garamond', Georgia, serif",
    sans: "'Jost', sans-serif",
    brand: "'Cormorant Garamond', Georgia, serif",
    trackingBrand: "0.22em",
    weightBrand: "500",
    vibe: "Aristokratisch, fließend & poetisch. Reminiszenz an Cartier, Chanel & Vogue Paris mit ultra-feinen Haarlinien.",
    details: "Display: Cormorant Garamond · Body & UI: Jost (Geometrische Schweizer Präzision)"
  },
  vogue: {
    id: "vogue",
    name: "High-Fashion Editorial (Vogue)",
    badge: "Modern Luxury · Didone",
    serif: "'Bodoni Moda', Didot, 'Bodoni MT', serif",
    sans: "'Plus Jakarta Sans', sans-serif",
    brand: "'Bodoni Moda', Didot, serif",
    trackingBrand: "0.18em",
    weightBrand: "600",
    vibe: "Dramatischer Hell-Dunkel-Kontrast & geometrische Perfektion wie auf dem Cover von Vogue & Harper's Bazaar.",
    details: "Display: Bodoni Moda (Opsz 6..96) · Body & UI: Plus Jakarta Sans (Modern Swiss Clarity)"
  },
  imperial: {
    id: "imperial",
    name: "Imperial Sanctuary & Classical Chic",
    badge: "Regal · Römische Majestät",
    serif: "'Cormorant Garamond', Georgia, serif",
    sans: "'Tenor Sans', 'Jost', sans-serif",
    brand: "'Cinzel', Georgia, serif",
    trackingBrand: "0.26em",
    weightBrand: "600",
    vibe: "Römisch-monumentale Majestät für den Namen CLEOPATRA, gepaart mit zarter Couture-Serif & Modeszene-Sans.",
    details: "Brand: Cinzel (Imperial Inscription) · Headlines: Cormorant Garamond · Body: Tenor Sans"
  },
  classic: {
    id: "classic",
    name: "Modern Classic (Playfair Enhanced)",
    badge: "Traditionell Veredelt",
    serif: "'Playfair Display', Georgia, serif",
    sans: "'Plus Jakarta Sans', sans-serif",
    brand: "'Playfair Display', Georgia, serif",
    trackingBrand: "0.16em",
    weightBrand: "500",
    vibe: "Die klassische Grand-Hotel-Wärme von Playfair, optimiert mit edlem Tracking & moderner Schweizer Sans.",
    details: "Display: Playfair Display (Refined Hierarchy) · Body & UI: Plus Jakarta Sans"
  }
};

const DEFAULT_TYPOGRAPHY = "paris";

function applyTypography(presetId, save = true) {
  const preset = TYPOGRAPHY_PRESETS[presetId] || TYPOGRAPHY_PRESETS[DEFAULT_TYPOGRAPHY];
  
  const root = document.documentElement;
  root.setAttribute("data-typography", preset.id);
  
  root.style.setProperty("--font-serif", preset.serif);
  root.style.setProperty("--font-sans", preset.sans);
  root.style.setProperty("--font-brand", preset.brand);
  root.style.setProperty("--tracking-brand", preset.trackingBrand);
  root.style.setProperty("--weight-brand", preset.weightBrand);

  if (save) {
    try {
      localStorage.setItem("cleopatra_typography_preset", preset.id);
    } catch (e) {
      // ignore localStorage quota errors
    }
  }

  // Update UI indicators in the switcher if present
  document.querySelectorAll(".typo-btn").forEach(btn => {
    const btnPreset = btn.getAttribute("data-preset");
    if (btnPreset === preset.id) {
      btn.classList.add("ring-2", "ring-gold-antique", "bg-espresso-dark", "text-gold-shimmer");
      btn.classList.remove("bg-cream-surface", "text-espresso-dark");
      const check = btn.querySelector(".typo-check");
      if (check) check.classList.remove("hidden");
    } else {
      btn.classList.remove("ring-2", "ring-gold-antique", "bg-espresso-dark", "text-gold-shimmer");
      btn.classList.add("bg-cream-surface", "text-espresso-dark");
      const check = btn.querySelector(".typo-check");
      if (check) check.classList.add("hidden");
    }
  });

  const activeLabel = document.getElementById("typo-active-label");
  if (activeLabel) {
    activeLabel.textContent = preset.name;
  }
}

function getActiveTypography() {
  try {
    return localStorage.getItem("cleopatra_typography_preset") || DEFAULT_TYPOGRAPHY;
  } catch (e) {
    return DEFAULT_TYPOGRAPHY;
  }
}

// Injects the interactive floating Studio Switcher onto any page (only when ?typo=1 or ?studio=1 is set)
function injectTypographySwitcher() {
  if (document.getElementById("cleopatra-typo-studio")) return;
  if (!window.location.search.includes("typo") && !window.location.search.includes("studio")) return;

  const currentPreset = getActiveTypography();

  const studio = document.createElement("div");
  studio.id = "cleopatra-typo-studio";
  studio.className = "fixed bottom-5 left-5 z-[9999] transition-all duration-300 font-sans text-left";
  
  studio.innerHTML = `
    <!-- Floating Collapsed Pill -->
    <div id="typo-dock-pill" class="flex items-center gap-2.5 bg-espresso-dark/95 text-gold-shimmer pl-4 pr-3 py-2 rounded-full shadow-2xl border border-gold-antique/50 backdrop-blur-xl cursor-pointer hover:bg-charcoal-soft transition-all group">
      <span class="material-symbols-outlined text-[18px] text-gold-antique group-hover:rotate-45 transition-transform">auto_awesome</span>
      <div class="flex flex-col">
        <span class="text-[9px] uppercase tracking-[0.2em] text-gold-shimmer/70 font-semibold leading-none">Typografie Studio</span>
        <span class="text-xs font-serif text-surface font-medium mt-0.5" id="typo-active-label">${TYPOGRAPHY_PRESETS[currentPreset]?.name || "Parisian Haute Couture"}</span>
      </div>
      <span class="material-symbols-outlined text-[16px] text-gold-antique ml-1" id="typo-dock-arrow">expand_less</span>
      <button type="button" aria-label="Widget schließen" onclick="event.stopPropagation(); document.getElementById('cleopatra-typo-studio').style.display='none';" class="w-5 h-5 ml-1 rounded-full bg-charcoal-soft/80 text-cream-muted hover:text-surface flex items-center justify-center transition-colors" title="Ausblenden">
        <span class="material-symbols-outlined text-[12px]">close</span>
      </button>
    </div>

    <!-- Expanded Studio Drawer -->
    <div id="typo-dock-panel" class="hidden absolute bottom-14 left-0 w-[340px] sm:w-[380px] bg-surface/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-border-warm p-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div class="flex items-center justify-between pb-3 border-b border-border-warm mb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-gold-antique text-[20px]">font_download</span>
          <div>
            <h4 class="font-serif text-sm font-semibold text-espresso-dark leading-tight">Haute Typografie Studio</h4>
            <p class="text-[10px] text-editorial-muted">Wählen Sie einen Stil zur Live-Vorschau</p>
          </div>
        </div>
        <button type="button" onclick="toggleTypoDock()" class="w-7 h-7 rounded-full bg-cream-surface text-editorial-muted hover:text-espresso-dark flex items-center justify-center transition-colors">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <!-- Presets List -->
      <div class="flex flex-col gap-2.5">
        ${Object.values(TYPOGRAPHY_PRESETS).map(p => `
          <button 
            type="button" 
            onclick="applyTypography('${p.id}')" 
            data-preset="${p.id}"
            class="typo-btn text-left p-3 rounded-xl transition-all border border-border-warm/80 flex items-start justify-between gap-3 ${p.id === currentPreset ? 'ring-2 ring-gold-antique bg-espresso-dark text-gold-shimmer' : 'bg-cream-surface hover:bg-cream-muted text-espresso-dark'}">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${p.id === currentPreset ? 'bg-gold-antique/30 text-gold-shimmer' : 'bg-surface-container text-gold-antique'} font-semibold">${p.badge}</span>
              </div>
              <span class="block font-serif text-base font-medium mt-1 leading-snug">${p.name}</span>
              <p class="text-[11px] opacity-80 mt-0.5 leading-relaxed">${p.details}</p>
            </div>
            <span class="material-symbols-outlined text-[18px] text-gold-antique typo-check shrink-0 mt-1 ${p.id === currentPreset ? '' : 'hidden'}">check_circle</span>
          </button>
        `).join('')}
      </div>

      <!-- Footer Action -->
      <div class="mt-4 pt-3 border-t border-border-warm flex items-center justify-between">
        <a href="typography-preview.html" class="inline-flex items-center gap-1.5 text-xs text-gold-antique hover:text-espresso-dark font-semibold tracking-wider uppercase transition-colors">
          <span>Gegenüberstellung ansehen</span>
          <span class="material-symbols-outlined text-[14px]">arrow_outward</span>
        </a>
        <button type="button" onclick="toggleTypoDock()" class="px-3 py-1.5 bg-espresso-dark hover:bg-charcoal-soft text-gold-shimmer text-xs rounded-lg font-semibold uppercase tracking-wider transition-colors">
          Schließen
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(studio);

  // Hook up toggle
  const pill = document.getElementById("typo-dock-pill");
  if (pill) {
    pill.addEventListener("click", toggleTypoDock);
  }
}

function toggleTypoDock() {
  const panel = document.getElementById("typo-dock-panel");
  const arrow = document.getElementById("typo-dock-arrow");
  if (!panel) return;
  
  if (panel.classList.contains("hidden")) {
    panel.classList.remove("hidden");
    if (arrow) arrow.textContent = "expand_more";
  } else {
    panel.classList.add("hidden");
    if (arrow) arrow.textContent = "expand_less";
  }
}

// Auto-run on DOM ready
(function initCleopatraTypography() {
  const active = getActiveTypography();
  applyTypography(active, false);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectTypographySwitcher();
      applyTypography(getActiveTypography(), false);
    });
  } else {
    injectTypographySwitcher();
    applyTypography(active, false);
  }
})();
