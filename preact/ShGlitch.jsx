export function ShGlitch({ active, intensity = 'medium', class: className, children, ...rest }) {
  const attrs = {};
  if (active) {
    attrs['data-sh-effect'] = 'glitch';
    if (intensity !== 'medium') {
      attrs['data-sh-glitch-intensity'] = intensity;
    }
  }

  return (
    <div class={className} {...attrs} {...rest}>
      {children}
    </div>
  );
}
