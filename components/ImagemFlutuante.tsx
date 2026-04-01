interface ImagemFlutuanteProps {
  src?: string
  lado?: 'left' | 'right'
  legenda?: string
  largura?: string
}

export function ImagemFlutuante({
  src,
  lado = 'right',
  legenda,
  largura = '240px',
}: ImagemFlutuanteProps) {
  if (!src) return null

  return (
    <figure
      style={{
        float: lado,
        margin: lado === 'right' ? '0.5rem 0 1rem 1.5rem' : '0.5rem 1.5rem 1rem 0',
        width: largura,
        flexShrink: 0,
        clear: 'none',
      }}
    >
      <img
        src={src}
        alt={legenda || ''}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '4px',
        }}
      />
      {legenda && (
        <figcaption
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted, #888)',
            textAlign: 'center',
            marginTop: '0.25rem',
            fontStyle: 'italic',
          }}
        >
          {legenda}
        </figcaption>
      )}
    </figure>
  )
}
