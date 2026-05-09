import styles from '../styles/ItemCard.module.css'

export default function ItemCard({ item, children })
{
    return (
        <div className={styles.card}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className={styles.image} />}
            <h3 className={styles.name}>{item.name}</h3>
            <p className={styles.description}>{item.description}</p>
            <div className={styles.footer}>
                <span className={styles.price}>${Number(item.price).toFixed(2)}</span>
                <span className={styles.stock}>{item.stock} in stock</span>
            </div>
            {children}
        </div>
    )
}
