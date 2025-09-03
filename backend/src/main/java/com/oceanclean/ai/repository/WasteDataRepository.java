package com.oceanclean.ai.repository;

import com.oceanclean.ai.entity.WasteData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteDataRepository extends JpaRepository<WasteData, Long> {
    
    List<WasteData> findByLabel(String label);
    
    List<WasteData> findByRiskScoreGreaterThanEqual(Double riskScore);
    
    List<WasteData> findByRiskScoreBetween(Double minRisk, Double maxRisk);
    
    @Query("SELECT w FROM WasteData w WHERE w.label = :label AND w.riskScore >= :minRisk")
    List<WasteData> findByLabelAndMinRisk(@Param("label") String label, @Param("minRisk") Double minRisk);
    
    @Query("SELECT DISTINCT w.label FROM WasteData w")
    List<String> findDistinctLabels();
    
    @Query("SELECT AVG(w.riskScore) FROM WasteData w")
    Double findAverageRiskScore();
    
    @Query("SELECT MAX(w.riskScore) FROM WasteData w")
    Double findMaxRiskScore();
    
    @Query("SELECT w.label, COUNT(w) FROM WasteData w GROUP BY w.label ORDER BY COUNT(w) DESC")
    List<Object[]> findLabelCounts();
}
