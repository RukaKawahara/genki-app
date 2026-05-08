"use client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import styles from "./GachaSuggestModal.module.css";

interface Props {
  onGo: () => void;
  onClose: () => void;
}

export default function GachaSuggestModal({ onGo, onClose }: Props) {
  return (
    <Modal onClose={onClose} centered sheetStyle={{ width: "90%", height: "90vh", borderRadius: "1.5rem" }}>
      <div className={styles.content}>
        <p className={styles.emoji}>🌟</p>
        <p className={styles.title}>しんどいね。</p>
        <p className={styles.text}>やる気ガチャを回してみる？</p>
        <div className={styles.buttons}>
          <Button fullWidth onClick={onGo}>回す！</Button>
          <Button fullWidth variant="ghost" onClick={onClose}>またあとで</Button>
        </div>
      </div>
    </Modal>
  );
}
